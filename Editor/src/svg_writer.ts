export interface Writer {
  rect(x: number, y: number, w: number, h: number, rounded: number | null, color: number | null): Writer;
  path(positions: [number, number][], color: number): Writer;
  circle(x: number, y: number, width: number, radius: number, color: number): void;
  save(name: string): void;
  clear(): void;
}
export class SvgWriter {
  content: string;
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    // this.content = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">\n`;
    // <svg width="100%" height="100%" viewBox="0 0 2481 3508" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;">
    this.content = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n
      <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
      <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;">\n`;
  }

  clear() {
    this.content =`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n
      <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
      <svg width="100%" height="100%" viewBox="0 0 ${this.width} ${this.height}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;">\n`; 
  }
  
  save(name: string) {
    this.content += '</svg>';
    const blob = new Blob([this.content], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${name}_${formatFullDate(new Date())}.svg`;

    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  circle(x: number, y: number, width: number, radius: number, color: number = 0) {
    this.content += `<circle cx="${x}" cy="${y}" r="${radius}" stroke="${numberToHexColor(color)}" stroke-width="${width}" fill="none" />\n`;
  }

  rect(x:number, y:number, w:number, h:number, color:number=0): SvgWriter {
    this.content += `<rect x="${x}" y="${y-h}" width="${w}" height="${h}" fill="${numberToHexColor(color)}" />\n`;
    return this;
  }

  path(positions: [number, number][], _color:number=0): SvgWriter {
    this.content += `<path d="M${positions[0][0]} ${positions[0][1]}`;
    for (let i = 1; i < positions.length; i++) {
      const pos = positions[i];
      this.content += ` L${pos[0]} ${pos[1]}`;
    }
    this.content += `"/>\n`;
    return this;
  }

}

function formatFullDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${year}#${month}#${day}#${hours}#${minutes}#${seconds}`;
}

function numberToHexColor(number: number): string {
  // Ensure the number is within the range [0, 16777215] (0xFFFFFF)
  const sanitizedNumber = Math.max(0, Math.min(number, 16777215));
  
  // Convert the number to a hexadecimal string and pad with zeros
  const hexColor = sanitizedNumber.toString(16).padStart(6, '0');
  
  // Add the "#" symbol to the front
  return `#${hexColor}`;
}
