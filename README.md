[![make.fun · news-image-20261127](https://make.fun/badge/news-image-20261127.svg)](https://make.fun/bounty/news-image-20261127?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261127)
[![rank](https://make.fun/badge/news-image-20261127/Masque999/news-image-20261127/rank.svg)](https://make.fun/bounty/news-image-20261127/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261127)
[![reward](https://make.fun/badge/news-image-20261127/Masque999/news-image-20261127/reward.svg)](https://make.fun/bounty/news-image-20261127?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261127)

# news-image-20261127

One image summing up the world's news of Friday 27 November 2026, as a newspaper front page: leading economies push back on the US plan for new tariffs on 14 trading partners; Kim Jong Un vows to build more nuclear weapons; a Houthi rocket strike hits a Saudi refinery; a fire engulfs the Bangchak oil refinery in Bangkok; a fuel tanker fire on Cairo's ring road kills at least 31; and Thanksgiving storms disrupt US holiday travel while Iraq jails eight French IS members for life. `main.ts` copies the image to `/output/entry.png`.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

The program copies `entry.png` (a 1024×1024 JPEG, 211,788 bytes) byte for byte, so repeated runs write identical bytes. It first checks the file is a whole JPEG or PNG of at most 1 MiB and exactly 1024 by 1024 pixels, then verifies the copy with a SHA-256 comparison.
