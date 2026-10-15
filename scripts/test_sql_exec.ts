import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Parse .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let val = match[2] || "";
      if (val.endsWith("\r")) val = val.slice(0, -1);
      process.env[match[1]] = val.trim();
    }
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function testExecSql() {
  console.log("Testing SQL endpoints...");
  // 1. Try pg-meta or sql endpoint
  try {
    const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query: "SELECT 1 as num" })
    });
    console.log("exec_sql status:", res.status);
    const data = await res.text();
    console.log("exec_sql response:", data);
  } catch (e: any) {
    console.log("exec_sql error:", e.message);
  }

  // 2. Try Supabase pg endpoint
  try {
    const res2 = await fetch(`${url}/pg/query`, {
      method: "POST",
      headers: {
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query: "SELECT 1 as num" })
    });
    console.log("pg/query status:", res2.status);
    const data2 = await res2.text();
    console.log("pg/query response:", data2);
  } catch (e: any) {
    console.log("pg/query error:", e.message);
  }
}

testExecSql().catch(console.error);
