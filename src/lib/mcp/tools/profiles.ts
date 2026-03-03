import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  loadConfigFile,
  loadConfig,
  listProfiles,
  getCurrentProfile,
  setCurrentProfile,
  saveProfile,
  deleteProfile,
} from "../../config.js";
import { maskToken, normalizePhoneNumber } from "../../constants.js";

export function registerProfileTools(server: McpServer): void {
  server.registerTool(
    "profile-info",
    {
      title: "Profile Info",
      description:
        "Returns the active Linq profile name, its phone number, and a list of all available profile names. Reads from ~/.linq/config.json.",
      inputSchema: {},
    },
    async () => {
      try {
        const configFile = await loadConfigFile();
        const profileName = process.env.LINQ_PROFILE || configFile.profile;
        const profile = configFile.profiles[profileName];

        const setupHints: string[] = [];
        if (!profile?.token) {
          setupHints.push("No API token configured. Run 'linq init' in your terminal to set up your account.");
        }
        if (!profile?.fromPhone) {
          setupHints.push("No default phone number configured. Run 'linq init' in your terminal to complete setup.");
        }

        const response: Record<string, unknown> = {
          activeProfile: profileName,
          fromPhone: profile?.fromPhone ?? null,
          availableProfiles: Object.keys(configFile.profiles),
        };
        if (setupHints.length > 0) {
          response.setup_hints = setupHints;
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(response, null, 2),
            },
          ],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error reading profile info: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "profile-list",
    {
      title: "List Profiles",
      description:
        "List all Linq profiles with their active status and phone numbers.",
      inputSchema: {},
    },
    async () => {
      try {
        const configFile = await loadConfigFile();
        const currentName = process.env.LINQ_PROFILE || configFile.profile;
        const profiles = Object.entries(configFile.profiles).map(
          ([name, profile]) => ({
            name,
            active: name === currentName,
            fromPhone: profile.fromPhone,
          })
        );
        return {
          content: [{ type: "text", text: JSON.stringify(profiles, null, 2) }],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error listing profiles: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "profile-use",
    {
      title: "Switch Profile",
      description:
        "Switch the active Linq profile. The next SDK call will use the new profile's token automatically.",
      inputSchema: {
        name: z.string().describe("The profile name to switch to"),
      },
    },
    async ({ name }) => {
      try {
        await setCurrentProfile(name);
        return {
          content: [
            { type: "text", text: `Switched to profile "${name}".` },
          ],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error switching profile: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "profile-create",
    {
      title: "Create Profile",
      description:
        "Create or update a Linq profile with an API token and/or phone number.",
      inputSchema: {
        name: z.string().describe("The profile name to create"),
        token: z
          .string()
          .optional()
          .describe("API token for this profile"),
        from_phone: z
          .string()
          .optional()
          .describe("Default sender phone number in E.164 format"),
      },
    },
    async ({ name, token, from_phone }) => {
      try {
        const existingProfiles = await listProfiles();
        if (existingProfiles.includes(name)) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Profile "${name}" already exists. Use profile-set to modify it.`,
              },
            ],
            isError: true,
          };
        }

        const profile: Record<string, string> = {};
        if (token) profile.token = token;
        if (from_phone) profile.fromPhone = normalizePhoneNumber(from_phone);
        await saveProfile(name, profile);
        return {
          content: [
            { type: "text", text: `Profile "${name}" saved.` },
          ],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating profile: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "profile-delete",
    {
      title: "Delete Profile",
      description:
        "Delete a Linq profile. Cannot delete the default profile. If the deleted profile was active, switches to default.",
      inputSchema: {
        name: z.string().describe("The profile name to delete"),
      },
    },
    async ({ name }) => {
      try {
        await deleteProfile(name);
        return {
          content: [
            { type: "text", text: `Profile "${name}" deleted.` },
          ],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error deleting profile: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "profile-get",
    {
      title: "Get Profile",
      description:
        "Get a profile's configuration. The API token is masked in the output for security.",
      inputSchema: {
        profile: z
          .string()
          .optional()
          .describe(
            "Profile name to read (defaults to active profile)"
          ),
        key: z
          .string()
          .optional()
          .describe(
            "Specific key to read (e.g., 'token', 'fromPhone'). Returns all keys if omitted."
          ),
      },
    },
    async ({ profile: profileName, key }) => {
      try {
        const config = await loadConfig(profileName);
        const name = profileName || (await getCurrentProfile());
        const masked = {
          ...config,
          token: config.token
            ? maskToken(config.token)
            : undefined,
        };

        if (key) {
          const value = (masked as Record<string, unknown>)[key];
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({ profile: name, [key]: value ?? null }, null, 2),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ profile: name, ...masked }, null, 2),
            },
          ],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error reading profile: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "profile-set",
    {
      title: "Set Profile Key",
      description:
        "Set a specific key on a profile. Allowed keys: token, fromPhone.",
      inputSchema: {
        key: z
          .string()
          .describe("The key to set (token or fromPhone)"),
        value: z.string().describe("The value to set"),
        profile: z
          .string()
          .optional()
          .describe("Profile name (defaults to active profile)"),
      },
    },
    async ({ key, value, profile: profileName }) => {
      try {
        if (key !== "token" && key !== "fromPhone") {
          throw new Error(`Invalid key "${key}". Allowed keys: token, fromPhone`);
        }
        const name = profileName || (await getCurrentProfile());
        const finalValue = key === 'fromPhone' ? normalizePhoneNumber(value) : value;
        await saveProfile(name, { [key]: finalValue });
        const displayValue = key === "token"
          ? maskToken(finalValue)
          : finalValue;
        return {
          content: [
            {
              type: "text",
              text: `Set ${key}=${displayValue} on profile "${name}".`,
            },
          ],
        };
      } catch (e) {
        return {
          content: [
            {
              type: "text",
              text: `Error setting profile key: ${e instanceof Error ? e.message : String(e)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
