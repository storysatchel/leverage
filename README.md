# Leverage Rap Sheet

An interactive character sheet and dice-pool assembler for the Leverage Roleplaying Game. Built with React, TypeScript, Vite and Tailwind CSS.

## Use

- In **Editing** mode, change names and die sizes, upload a portrait, and add specialties, talents, assets and complications. The specialty catalog contains examples, not a definitive list; custom entries are supported. Talent names and page references are provided for lookup, not a substitute for the books. Talents have no inherent die rating: the adjustable die is available for effects that actually grant one.
- In **Playing** mode, select rated traits to add their configured dice to the pool. A distinction can add d8, or d4 and a plot point when it hinders. Roll individual dice, copy a command, or clear the pool.
- **Import / Export** validates and copies the full JSON rap sheet, including its portrait. The modal also provides a schema and QR sharing. State is encoded in the URL, so save the URL or JSON; large portraits can make links or QR codes impractically large.
- Print the sheet using **Print PDF**. This fork uses a Leverage-specific schema; Marvel data files are not migrated.

## Development

```sh
pnpm install
pnpm run dev
pnpm test --run
pnpm run build
```

## License

MIT License. Book titles, names, and game material belong to their respective owners.
