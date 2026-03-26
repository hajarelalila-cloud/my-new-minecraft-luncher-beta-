// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

import Apple from "./assets/Apple";
import Linux from "./assets/Linux";
import Windows from "./assets/Windows";

export const APP_URLS = {
  cdn: "https://cdn.nokiatis-launcher.com",
  socials: {
    discord: "https://discord.nokiatis-launcher.com",
    github: "https://github.com/nokiatis-team/Nokiatis Launcher-Carbon",
    instagram: "https://www.instagram.com/nokiatis-launcher",
    twitter: "https://twitter.com/nokiatis-launcher",
  },
  newsletter: "https://api.nokiatis.gg/v1",
  olddownload: {
    win: "https://github.com/nokiatis-team/Nokiatis Launcher/releases/latest/download/Nokiatis Launcher-win-setup.exe",
    macOs:
      "https://github.com/nokiatis-team/Nokiatis Launcher/releases/latest/download/Nokiatis Launcher-mac-setup.dmg",
    linux:
      "https://github.com/nokiatis-team/Nokiatis Launcher/releases/latest/download/Nokiatis Launcher-linux-setup.AppImage",
    releases: "https://github.com/nokiatis-team/Nokiatis Launcher/releases",
  },
};
export const ADD_USER_ENDPOINT = `${APP_URLS.newsletter}/mailing`;

export const SITE_TITLE =
  "Nokiatis Launcher - Your All-In-One Modded Minecraft Launcher";
export const SITE_DESCRIPTION =
  "Nokiatis Launcher - Your All-In-One Modded Minecraft Launcher";

export const DownloadItems: Array<{
  item: Element | string;
}> = [
  {
    item: (
      <a class="flex items-center gap-2 p-1">
        <Apple /> MacOS
      </a>
    ) as Element,
  },
  {
    item: (
      <a class="flex items-center gap-2 p-1">
        <Windows /> Windows
      </a>
    ) as Element,
  },
  {
    item: (
      <a class="flex items-center gap-2 p-1">
        <Linux /> Linux
      </a>
    ) as Element,
  },
];
