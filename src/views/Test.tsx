import pako from "pako";
import { useState } from "react";
import type { Favorite } from "../libs/Videos/VideoModel";

export default function Test() {
  const [compressed, setCompressed] = useState("");
  const [decompressed, setDecompressed] = useState<Favorite[] | null>(null);
  const [input, setInput] = useState("");
  const stored = localStorage.getItem("favorites") ?? "";

  const compress = (str: string) => {
    const binary = pako.gzip(str);
    setCompressed(btoa(String.fromCharCode(...binary)));
  };

  const decompress = (base64: string) => {
    const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const decompressResult = pako.ungzip(binary, { to: "string" });
    setDecompressed(JSON.parse(decompressResult));
  };

  return (
    <div>
      <div>
        <button onClick={() => compress(stored)}>export your list</button>
        <p style={{ wordWrap: "break-word" }}>{compressed}</p>
      </div>
      <div>
        <p>Decompress</p>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={() => decompress(input)}>Decompress now!</button>

        {decompressed && (
          <div>
            {decompressed.map((item) => (
              <div key={item.id}>
                <div>{item.title}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
