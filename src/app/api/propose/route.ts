import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, apiKey } = body;

    if (!apiKey || !prompt) {
      return NextResponse.json(
        { error: { message: "Missing apiKey or prompt" } },
        { status: 400 }
      );
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const text = await res.text();

    try {
      const data = JSON.parse(text);
      return NextResponse.json(data);
    } catch {
      return NextResponse.json(
        { error: { message: "Invalid response: " + text.slice(0, 200) } },
        { status: 500 }
      );
    }
  } catch (e) {
    return NextResponse.json(
      { error: { message: String(e) } },
      { status: 500 }
    );
  }
}
