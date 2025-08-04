import Link from "next/link";
import { tools } from "@/lib/categories";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Free Online Tools</h1>
        <p className="text-xl text-gray-600">
          Essential tools for developers and everyone
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.path}
            href={tool.path}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border hover:border-blue-300"
          >
            <div className="text-4xl mb-4">{tool.emoji}</div>
            <h3 className="text-xl font-semibold mb-2">{tool.name}</h3>
            <p className="text-gray-600">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
