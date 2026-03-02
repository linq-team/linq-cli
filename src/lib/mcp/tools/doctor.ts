import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type Linq from "@linqapp/sdk";
import {
  loadConfigFile,
  getSandboxProfile,
  isSandboxExpired,
} from "../../config.js";

interface Check {
  name: string;
  status: "pass" | "fail" | "warn";
  detail: string;
}

export function registerDoctorTools(server: McpServer, client: Linq): void {
  server.registerTool(
    "doctor",
    {
      title: "Diagnostics",
      description:
        "Run diagnostic checks on your Linq configuration and API connectivity. Checks config file, API token, default phone, API connectivity, and sandbox status.",
      inputSchema: {},
    },
    async () => {
      const checks: Check[] = [];

      // 1. Config file exists with profiles
      try {
        const configFile = await loadConfigFile();
        const profileCount = Object.keys(configFile.profiles).length;
        checks.push({
          name: "Config file",
          status: "pass",
          detail: `Found ${profileCount} profile(s): ${Object.keys(configFile.profiles).join(", ")}`,
        });

        // 2. API token configured
        const profileName = process.env.LINQ_PROFILE || configFile.profile;
        const activeProfile = configFile.profiles[profileName];
        if (activeProfile?.token) {
          const masked =
            activeProfile.token.slice(0, 8) + "..." + activeProfile.token.slice(-4);
          checks.push({
            name: "API token",
            status: "pass",
            detail: `Active profile "${profileName}" has token ${masked}`,
          });
        } else {
          checks.push({
            name: "API token",
            status: "fail",
            detail: `Active profile "${profileName}" has no token configured`,
          });
        }

        // 3. Default phone set
        if (activeProfile?.fromPhone) {
          checks.push({
            name: "Default phone",
            status: "pass",
            detail: activeProfile.fromPhone,
          });
        } else {
          checks.push({
            name: "Default phone",
            status: "warn",
            detail: "No default phone set on active profile",
          });
        }

        // 4. Sandbox status
        const sandbox = await getSandboxProfile();
        if (sandbox) {
          const expired = isSandboxExpired(sandbox);
          checks.push({
            name: "Sandbox",
            status: expired ? "warn" : "pass",
            detail: expired
              ? `Sandbox expired at ${sandbox.expiresAt}`
              : `Sandbox active until ${sandbox.expiresAt}`,
          });
        }
      } catch (e) {
        checks.push({
          name: "Config file",
          status: "fail",
          detail: `Cannot read config: ${e instanceof Error ? e.message : String(e)}`,
        });
      }

      // 5. API connectivity
      try {
        const start = Date.now();
        const result = await client.phoneNumbers.list();
        const latency = Date.now() - start;
        const count = Array.isArray(result) ? result.length : (result as any)?.data?.length ?? "?";
        checks.push({
          name: "API connectivity",
          status: "pass",
          detail: `OK (${latency}ms) — ${count} phone number(s)`,
        });
      } catch (e) {
        checks.push({
          name: "API connectivity",
          status: "fail",
          detail: `API call failed: ${e instanceof Error ? e.message : String(e)}`,
        });
      }

      const passed = checks.filter((c) => c.status === "pass").length;
      const failed = checks.filter((c) => c.status === "fail").length;
      const warned = checks.filter((c) => c.status === "warn").length;

      const summary = `${passed} passed, ${failed} failed, ${warned} warnings`;

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ summary, checks }, null, 2),
          },
        ],
      };
    }
  );
}
