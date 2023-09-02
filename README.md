# HCI-Editor
## How to run
There are two ways to run this. In the browser with node.js or natively with tauri

Node.js:
- Install node.js 
- cd into the Editor folder 
- run `npm run dev`
- open your browser on localhost:5173

Tauri:
On windows you can download the [latest release](https://github.com/FelixReinhard/HCI-Editor/releases/latest)https://github.com/FelixReinhard/HCI-Editor/releases/latest)
On Mac you need to compile yourself.
- Make sure you have node.js and three.js installed on your system.
- Install the rust [toolchain](https://www.rust-lang.org/) and tauri with ´cargo install tauri-cli´
- Build: `cargo tauri build` (or `cargo tauri dev`)
- navigate into src-tauri/target/release and find your executeble
