# Nokiatis Launcher

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

## 🎮 What is Nokiatis Launcher

Nokiatis Launcher is a custom Minecraft launcher written from the ground up in Rust and SolidJS. Its main goal is to make it easy and enjoyable to manage different Minecraft versions, install modloaders, mods and modpacks from different platforms, bringing the playing and modding experience to the next level!

**Made with ❤️ by Nokiatis Team**

## Table of Content

<details>
 <summary><strong>Table of Contents</strong> (click to expand)</summary>

- [Nokiatis Launcher](#nokiatis-launcher)
  - [🎮 What is Nokiatis Launcher](#-what-is-nokiatis-launcher)
  - [Table of Content](#table-of-content)
  - [📥 Download](#-download)
  - [🎉 Join our community](#-join-our-community)
  - [🎁 Features](#-features)
  - [▶️ Development](#️-development)
    - [Requirements](#requirements)
    - [Pnpm](#pnpm)
    - [Install Dependencies](#install-dependencies)
    - [Run app in dev mode](#run-app-in-dev-mode)
    - [Generate DB migration](#generate-db-migration)
  - [🔍 Test](#-test)
  - [\</\> Lint](#-lint)
  - [\</\> Code Formatting](#-code-formatting)
  - [🚚 Production](#-production)
  - [🎓 License](#-license)
  - [🙏 Credits](#-credits)

</details>

## 📥 Download

Nokiatis Launcher is currently in development. Stay tuned for release announcements!

## 🎉 Join our community

Join the Nokiatis Team community for support and to connect with other players!

## 🎁 Features

- 🎮 Easily install any minecraft version and **modloader**, including `forge`, `fabric`, `quilt`, `neoforge`
- 📦 Install `addons` from **CurseForge**, **Modrinth** and more!
- 📦 Install `modpacks` from **CurseForge**, **Modrinth** and more!
- ☕ Automatic **Java Manager**. You don't need to have java installed on your system, the launcher will take care of installing the correct java version for you!
- 🔄 Built-in **auto updater**
- 👥 **Multi account** support
- 🐢 Still playing on your grandma's pc from the 80s? Don't worry, we got you covered with **Potato PC Mode**!
- ⬇️ Import/export instances from/to other launchers like **Curseforge**, **MultiMC**, **ATLauncher**, **Technic**, **Prism**, **Modrinth**, **FTB** and more!

## ▶️ Development

### Requirements

- Node 22.x.x
- Rust >= 1.85.1

### Pnpm

At this point make sure you have pnpm installed:

`npm install -g pnpm`

### Install Dependencies

`pnpm i`

### Run app in dev mode

First of all you'll need to generate the prisma code and rspc bindings. To do that run

`pnpm codegen`

Now you can run the native core in watch mode

`pnpm watch:core`
Note: Core module hot reload doesn't currently work on windows

Now open a new terminal and run the actual app

`pnpm watch:app`

### Generate DB migration

To generate a new migration please run

`pnpm prisma:migrate --name {migration_name}`

Replace `{migration_name}` with the name of the migration you want to create.

## 🔍 Test

To run tests please run

`pnpm test`

## </> Lint

To run lint please run

`pnpm lint`

## </> Code Formatting

A [`.editorconfig`](https://editorconfig.org/) is in the repo to normalize inconsistencies your editor may make when saving a file such as indentation and line endings. Make sure the plugin is installed for your editor.

## 🚚 Production

`pnpm build:{win|mac|linux}-{x64|arm64}`

## 🎓 License

Nokiatis Launcher is released under the Business Source License 1.1 (BSL 1.1) - see the [LICENSE](LICENSE) file for details

## 🙏 Credits

**Nokiatis Launcher** is developed and maintained by **Nokiatis Team**.

Based on the original Nokiatis Launcher Carbon project.

---

<p align="center">
  <strong>Made with ❤️ by Nokiatis Team</strong>
</p>
