export class SvgWriter {
  content: string;
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.content = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">\n`;
  }
  
  save() {
    this.content += '</svg>';
    const blob = new Blob([this.content], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `file_${this.formatFullDate(new Date())}.svg`;

    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  rect(x:number, y:number, w:number, h:number, rounded:number=0, color:number=0): SvgWriter {
    this.content += `<rect x="${x}" y="${y-h}" width="${w}" height="${h}" rx="${rounded}" fill="${color}"/>\n`;
    return this;
  }

  path(positions: [number, number][], color:number=0): SvgWriter {
    this.content += `<path d="M${positions[0][0]} ${positions[0][1]}`;
    for (let i = 1; i < positions.length; i++) {
      const pos = positions[i];
      this.content += ` L${pos[0]} ${pos[1]}`;
    }
    this.content += `" fill="${color}" />\n`;
    return this;
  }


  formatFullDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}:${month}:${day}:${hours}:${minutes}:${seconds}`;
  }

}

function numberToHexColor(number: number): string {
  // Ensure the number is within the range [0, 16777215] (0xFFFFFF)
  const sanitizedNumber = Math.max(0, Math.min(number, 16777215));
  
  // Convert the number to a hexadecimal string and pad with zeros
  const hexColor = sanitizedNumber.toString(16).padStart(6, '0');
  
  // Add the "#" symbol to the front
  return `#${hexColor}`;
}
