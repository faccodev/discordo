import type { ApplicationCommand } from "@/lib/discord/types";

function fuzzyMatch(query: string, cmdName: string): boolean {
  const q = query.toLowerCase();
  const c = cmdName.toLowerCase();

  if (c.startsWith(q)) return true;
  if (c.includes(q)) return true;

  let qi = 0;
  for (let ci = 0; ci < c.length && qi < q.length; ci++) {
    if (c[ci] === q[qi]) qi++;
  }
  return qi === q.length;
}

export function filterCommands(commands: ApplicationCommand[], query: string): ApplicationCommand[] {
  if (!query) return commands;

  const searchTerm = query.toLowerCase();
  return commands.filter((cmd) => fuzzyMatch(searchTerm, cmd.name));
}

export function buildCommandUsage(cmd: ApplicationCommand): string {
  const parts = ["/" + cmd.name];

  const addOptions = (options: ApplicationCommand["options"], prefix = "") => {
    if (!options) return;
    for (const opt of options) {
      if (opt.type === 1 || opt.type === 2) {
        // SUB_COMMAND or SUB_COMMAND_GROUP
        parts.push(prefix + opt.name);
        addOptions(opt.options, prefix + opt.name + " ");
      } else {
        const required = opt.required ? `<${opt.name}>` : `[${opt.name}]`;
        parts.push(required);
      }
    }
  };

  addOptions(cmd.options);
  return parts.join(" ");
}