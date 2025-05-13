import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

interface ToolRequest {
  tool: string;
  args?: string[];
}

interface ToolResponse {
  output?: string;
  error?: string;
}

export async function POST(req: Request) {
  try {
    const { tool, args } = await req.json() as ToolRequest;
    
    if (!tool) {
      return NextResponse.json<ToolResponse>(
        { error: 'Tool name is required' },
        { status: 400 }
      );
    }

    // Whitelist of allowed tools to prevent arbitrary command execution
    const allowedTools = ['subfinder'] as const;
    type AllowedTool = typeof allowedTools[number];

    if (!allowedTools.includes(tool as AllowedTool)) {
      return NextResponse.json<ToolResponse>(
        { error: 'Tool not allowed' },
        { status: 403 }
      );
    }

    // Sanitize arguments to prevent command injection
    const sanitizedArgs = Array.isArray(args)
      ? args
          .map(arg => arg.replace(/[^a-zA-Z0-9.-]/g, ''))
          .filter(Boolean)
          .join(' ')
      : '';

    const command = `${tool} ${sanitizedArgs}`;

    try {
      const { stdout, stderr } = await execPromise(command, { timeout: 30000 });
      
      if (stderr) {
        console.error(`Tool execution error: ${stderr}`);
        return NextResponse.json<ToolResponse>(
          { error: stderr },
          { status: 500 }
        );
      }
      
      return NextResponse.json<ToolResponse>({ output: stdout });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to execute tool';
      console.error(`Tool execution failed: ${errorMessage}`);
      return NextResponse.json<ToolResponse>(
        { error: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to process request';
    console.error(`API error: ${errorMessage}`);
    return NextResponse.json<ToolResponse>(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 