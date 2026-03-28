import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { serialize } from 'next-mdx-remote/serialize';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic');
  const lens = searchParams.get('lens');

  if (!topic || !lens) {
    return NextResponse.json({ error: 'Missing topic or lens' }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), 'content', topic, `${lens}.mdx`);
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    // Using gray-matter or relying on serialize to handle frontmatter
    const mdxSource = await serialize(fileContent, { parseFrontmatter: true });
    
    return NextResponse.json({ source: mdxSource });
  } catch (error) {
    console.error('Error reading or parsing MDX:', error);
    return NextResponse.json({ error: 'Content not found' }, { status: 404 });
  }
}
