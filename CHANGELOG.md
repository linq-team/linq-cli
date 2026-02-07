## [1.2.3](https://github.com/linq-team/linq-cli/compare/v1.2.2...v1.2.3) (2026-02-07)


### Bug Fixes

* run oclif directly instead of via pnpm exec on Windows ([ad814fb](https://github.com/linq-team/linq-cli/commit/ad814fbc4f32955ab31e00fdbfc7bedd43d83b50))

## [1.2.2](https://github.com/linq-team/linq-cli/compare/v1.2.1...v1.2.2) (2026-02-07)


### Bug Fixes

* add Git usr/bin to PATH for GNU tar on Windows ([25ff872](https://github.com/linq-team/linq-cli/commit/25ff872072054c71a55c857486f407bea761bc18))
* use PowerShell for Windows build and add [skip ci] to release commits ([ccd2f41](https://github.com/linq-team/linq-cli/commit/ccd2f412255afef8f33710510c3edacfade72780))

## [1.2.1](https://github.com/linq-team/linq-cli/compare/v1.2.0...v1.2.1) (2026-02-07)


### Bug Fixes

* restore semantic-release git plugin with PAT for branch protection bypass ([6dd76cf](https://github.com/linq-team/linq-cli/commit/6dd76cfcfc831b68fa024b686942e3ca665a719d))

## [1.0.5](https://github.com/linq-team/linq-cli/compare/v1.0.4...v1.0.5) (2026-01-31)


### Bug Fixes

* **ci:** remove tarball builds from release assets ([f18264a](https://github.com/linq-team/linq-cli/commit/f18264ac356b5be61df34f2a02c793e3766a418d))

## [1.0.4](https://github.com/linq-team/linq-cli/compare/v1.0.3...v1.0.4) (2026-01-31)


### Bug Fixes

* **ci:** add NSIS to PATH for Windows installer build ([c2668ad](https://github.com/linq-team/linq-cli/commit/c2668adbe09356e89ba30cde42be423a4c105ffa))

## [1.0.3](https://github.com/linq-team/linq-cli/compare/v1.0.2...v1.0.3) (2026-01-31)


### Bug Fixes

* **ci:** fix Windows tar and add macOS identifier for oclif pack ([0faafd2](https://github.com/linq-team/linq-cli/commit/0faafd2c643248c5c3eff32e527dd9a381ecae65))

## [1.0.2](https://github.com/linq-team/linq-cli/compare/v1.0.1...v1.0.2) (2026-01-31)


### Bug Fixes

* make lefthook install optional for production builds ([0425a2a](https://github.com/linq-team/linq-cli/commit/0425a2a82105b12fd9854ab2c26190ba33f44156))

## [1.0.1](https://github.com/linq-team/linq-cli/compare/v1.0.0...v1.0.1) (2026-01-31)


### Bug Fixes

* **ci:** trigger build-assets after Release workflow completes ([72552ac](https://github.com/linq-team/linq-cli/commit/72552aca3139fcbc4d0cedfdee389cea3ff07680))
* remove redundant CLI description from banner ([02c727e](https://github.com/linq-team/linq-cli/commit/02c727e21d18d61f1c39dc73dae7abb5fa26ff9e))

# [1.0.0](https://github.com/linq-team/linq-cli/compare/v0.4.1...v1.0.0) (2026-01-31)


### Features

* restructure CLI commands to match OpenAPI spec ([193d553](https://github.com/linq-team/linq-cli/commit/193d55330fd80e1cf49adac2cacaae690e28605b))


### BREAKING CHANGES

* `linq send` is now `linq chats create`

## [0.4.1](https://github.com/linq-team/linq-cli/compare/v0.4.0...v0.4.1) (2026-01-31)


### Bug Fixes

* banner ascii ¯\_(ツ)_/¯ ([a2c89de](https://github.com/linq-team/linq-cli/commit/a2c89de4e475ed1b0cdd3a2cd12c358de6913e0d))

# [0.4.0](https://github.com/linq-team/linq-cli/compare/v0.3.1...v0.4.0) (2026-01-31)


### Features

* simplify CLI with config commands and streamlined auth ([594b098](https://github.com/linq-team/linq-cli/commit/594b098eb248520bb0ab15b409db3640908b2785))

## [0.3.1](https://github.com/linq-team/linq-cli/compare/v0.3.0...v0.3.1) (2026-01-29)


### Bug Fixes

* update cli ascii logo ([4153c19](https://github.com/linq-team/linq-cli/commit/4153c19c7498b9db9006a91ecf766be873118ebf))

# [0.3.0](https://github.com/linq-team/linq-cli/compare/v0.2.0...v0.3.0) (2026-01-29)


### Features

* add ASCII art banner with linq logo to CLI help ([38ca963](https://github.com/linq-team/linq-cli/commit/38ca96350575f105a30b0c8fac03e85ed406463e))

# [0.2.0](https://github.com/linq-team/linq-cli/compare/v0.1.0...v0.2.0) (2026-01-29)


### Bug Fixes

* add [skip ci] to release commits to prevent CI loop ([ca8aa06](https://github.com/linq-team/linq-cli/commit/ca8aa063b0a9fd147cc92f45eae0f70ca7c77dfd))
* disable npm publish until org is created ([3272f7b](https://github.com/linq-team/linq-cli/commit/3272f7b6a86351c703ba878fcc187e5a20600912))
* update pnpm-lock.yaml during semantic-release ([a2ff88f](https://github.com/linq-team/linq-cli/commit/a2ff88f12310ed1773cd98b38bd35a5bc8baa0b0))


### Features

* add CI/CD with semantic-release and multi-platform builds ([14bf86f](https://github.com/linq-team/linq-cli/commit/14bf86ffc47c2a0d0c1395493177d3b8fe4aa905))
* add npm publishing as @linq/cli ([6cfd5da](https://github.com/linq-team/linq-cli/commit/6cfd5dafb7b03b212daa8a011005229e01574b1e))
