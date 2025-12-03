const fs = require("fs");
const path = require("path");

const filesToCreate = {
  "src/api/base44Client.js": `
const BASE_URL = "https://api.base44.ai";

export async function base44Client(endpoint, payload = {}) {
  const res = await fetch(\`\${BASE_URL}/\${endpoint}\`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(\`Base44 API Error: \${res.status}\`);
  }

  return res.json();
}
`,

  "src/utils/index.js": `
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
`,

  // UI components
  "src/components/ui/button.jsx": `
export default function Button({ children, className = "", ...props }) {
  return (
    <button
      className={"px-4 py-2 rounded bg-blue-600 text-white " + className}
      {...props}
    >
      {children}
    </button>
  );
}
`,

  "src/components/ui/input.jsx": `
export default function Input(props) {
  return (
    <input
      className="border rounded px-3 py-2 w-full"
      {...props}
    />
  );
}
`,

  "src/components/ui/label.jsx": `
export default function Label({ children, ...props }) {
  return (
    <label className="block font-medium mb-1" {...props}>
      {children}
    </label>
  );
}
`,

  "src/components/ui/select.jsx": `
export default function Select({ children, ...props }) {
  return (
    <select
      className="border rounded px-3 py-2 w-full"
      {...props}
    >
      {children}
    </select>
  );
}
`,

  "src/components/ui/textarea.jsx": `
export default function Textarea(props) {
  return (
    <textarea
      className="border rounded px-3 py-2 w-full"
      {...props}
    />
  );
}
`,

  "src/components/ui/dialog.jsx": `
import { useState } from "react";

export function Dialog({ trigger, children }) {
  const [open, setOpen] = useState(false);

  const Trigger = trigger(() => setOpen(true));

  return (
    <>
      {Trigger}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-lg min-w-[300px]">
            {children({ close: () => setOpen(false) })}
          </div>
        </div>
      )}
    </>
  );
}
`,

  "src/components/ui/badge.jsx": `
export default function Badge({ children, className = "" }) {
  return (
    <span className={"px-2 py-1 text-xs bg-gray-200 rounded " + className}>
      {children}
    </span>
  );
}
`,

  "src/components/ui/card.jsx": `
export function Card({ children }) {
  return <div className="border rounded p-4 shadow">{children}</div>;
}

export function CardHeader({ children }) {
  return <div className="mb-2 font-bold">{children}</div>;
}

export function CardContent({ children }) {
  return <div>{children}</div>;
}
`,

  "src/components/ui/tabs.jsx": `
import { useState } from "react";

export function Tabs({ tabs }) {
  const [active, setActive] = useState(Object.keys(tabs)[0]);

  return (
    <div>
      <div className="flex gap-2 border-b">
        {Object.keys(tabs).map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={"px-3 py-2 " + (active === tab ? "border-b-2 border-blue-600" : "")}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="mt-4">{tabs[active]}</div>
    </div>
  );
}
`,

  "src/components/ui/alert.jsx": `
export default function Alert({ children, type = "info" }) {
  const colors = {
    info: "bg-blue-100 text-blue-800",
    error: "bg-red-100 text-red-800",
    success: "bg-green-100 text-green-800",
  };

  return (
    <div className={"p-3 rounded " + colors[type]}>
      {children}
    </div>
  );
}
`,

  "src/components/ui/checkbox.jsx": `
export default function Checkbox(props) {
  return (
    <input type="checkbox" className="w-4 h-4" {...props} />
  );
}
`,
};

// Create files if missing
Object.entries(filesToCreate).forEach(([filePath, content]) => {
  const fullPath = path.join(process.cwd(), filePath);
  const dir = path.dirname(fullPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log("📁 Created folder:", dir);
  }

  if (!fs.existsSync(fullPath)) {
    fs.writeFileSync(fullPath, content.trim());
    console.log("📄 Created file:", filePath);
  } else {
    console.log("✔️ Already exists:", filePath);
  }
});
