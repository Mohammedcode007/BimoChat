export type StickerItem = {
  id: string;
  title: string;
  url: string;
  mimeType?: string;
};

export type StickerPack = {
  id: string;
  title: string;
  icon: string;
  stickers: StickerItem[];
};

export const STICKER_PACKS: StickerPack[] = [
  {
    id: "cute_bear",
    title: "Bear",
    icon: "🐻",
    stickers: [
      {
        id: "bear_hi",
        title: "Hi",
        url: "https://media.giphy.com/media/ASd0Ukj0y3qMM/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "bear_love",
        title: "Love",
        url: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "bear_happy",
        title: "Happy",
        url: "https://media.giphy.com/media/MDJ9IbxxvDUQM/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "bear_angry",
        title: "Angry",
        url: "https://media.giphy.com/media/11tTNkNy1SdXGg/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "bear_sad",
        title: "Sad",
        url: "https://media.giphy.com/media/OPU6wzx8JrHna/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "bear_laugh",
        title: "Laugh",
        url: "https://media.giphy.com/media/10JhviFuU2gWD6/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "bear_dance",
        title: "Dance",
        url: "https://media.giphy.com/media/3oEduSbSGpGaRX2Vri/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "bear_cute",
        title: "Cute",
        url: "https://media.giphy.com/media/IThjAlJnD9WNO/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "bear_sleep",
        title: "Sleep",
        url: "https://media.giphy.com/media/3o7TKtnuHOHHUjR38Y/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "bear_shy",
        title: "Shy",
        url: "https://media.giphy.com/media/5GoVLqeAOo6PK/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "bear_no",
        title: "No",
        url: "https://media.giphy.com/media/3ohhwNxuGh3gnyGG7S/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "bear_yes",
        title: "Yes",
        url: "https://media.giphy.com/media/111ebonMs90YLu/giphy.gif",
        mimeType: "image/gif",
      },
    ],
  },

  {
    id: "cute_cat",
    title: "Cat",
    icon: "🐱",
    stickers: [
      {
        id: "cat_love",
        title: "Love",
        url: "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "cat_sleep",
        title: "Sleep",
        url: "https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "cat_hello",
        title: "Hello",
        url: "https://media.giphy.com/media/vFKqnCdLPNOKc/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "cat_funny",
        title: "Funny",
        url: "https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "cat_shock",
        title: "Shock",
        url: "https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "cat_cry",
        title: "Cry",
        url: "https://media.giphy.com/media/9Y5BbDSkSTiY8/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "cat_angry",
        title: "Angry",
        url: "https://media.giphy.com/media/ToMjGpOjkiEjzJ1ZaJG/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "cat_dance",
        title: "Dance",
        url: "https://media.giphy.com/media/GeimqsH0TLDt4tScGw/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "cat_typing",
        title: "Typing",
        url: "https://media.giphy.com/media/ule4vhcY1xEKQ/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "cat_wink",
        title: "Wink",
        url: "https://media.giphy.com/media/13CoXDiaCcCoyk/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "cat_smile",
        title: "Smile",
        url: "https://media.giphy.com/media/12bjQ7uASAaCKk/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "cat_hide",
        title: "Hide",
        url: "https://media.giphy.com/media/11s7Ke7jcNxCHS/giphy.gif",
        mimeType: "image/gif",
      },
    ],
  },

  {
    id: "cute_dog",
    title: "Dog",
    icon: "🐶",
    stickers: [
      {
        id: "dog_hi",
        title: "Hi",
        url: "https://media.giphy.com/media/4Zo41lhzKt6iZ8xff9/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "dog_love",
        title: "Love",
        url: "https://media.giphy.com/media/3oEjI4sFlp73fvEYgw/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "dog_happy",
        title: "Happy",
        url: "https://media.giphy.com/media/kiBcwEXegBTACmVOnE/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "dog_laugh",
        title: "Laugh",
        url: "https://media.giphy.com/media/3o7527pa7qs9kCG78A/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "dog_sad",
        title: "Sad",
        url: "https://media.giphy.com/media/OPU6wzx8JrHna/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "dog_excited",
        title: "Excited",
        url: "https://media.giphy.com/media/l0HlSNOxJB956qwfK/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "dog_sleep",
        title: "Sleep",
        url: "https://media.giphy.com/media/3o6ZtaO9BZHcOjmErm/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "dog_run",
        title: "Run",
        url: "https://media.giphy.com/media/xUPGcEliCc7bETyfO8/giphy.gif",
        mimeType: "image/gif",
      },
    ],
  },

  {
    id: "reactions",
    title: "Reactions",
    icon: "✨",
    stickers: [
      {
        id: "reaction_fire",
        title: "Fire",
        url: "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "reaction_clap",
        title: "Clap",
        url: "https://media.giphy.com/media/l3q2XhfQ8oCkm1Ts4/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "reaction_wow",
        title: "Wow",
        url: "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "reaction_ok",
        title: "OK",
        url: "https://media.giphy.com/media/3o6Zt8MgUuvSbkZYWc/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "reaction_heart",
        title: "Heart",
        url: "https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "reaction_thanks",
        title: "Thanks",
        url: "https://media.giphy.com/media/3oz8xIsloV7zOmt81G/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "reaction_lol",
        title: "LOL",
        url: "https://media.giphy.com/media/3o6Zt4HU9uwXmXSAuI/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "reaction_shock",
        title: "Shock",
        url: "https://media.giphy.com/media/3o7527pa7qs9kCG78A/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "reaction_cry",
        title: "Cry",
        url: "https://media.giphy.com/media/d2lcHJTG5Tscg/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "reaction_facepalm",
        title: "Facepalm",
        url: "https://media.giphy.com/media/3xz2BLBOt13X9AgjEA/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "reaction_dance",
        title: "Dance",
        url: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "reaction_party",
        title: "Party",
        url: "https://media.giphy.com/media/3o6fJ1BM7R2EBRDnxK/giphy.gif",
        mimeType: "image/gif",
      },
    ],
  },

  {
    id: "love",
    title: "Love",
    icon: "❤️",
    stickers: [
      {
        id: "love_heart_1",
        title: "Heart",
        url: "https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "love_heart_2",
        title: "Love You",
        url: "https://media.giphy.com/media/l4Ki4biBSwhjyrS48/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "love_kiss",
        title: "Kiss",
        url: "https://media.giphy.com/media/3o7TKsQ8UQ4l4LhGz6/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "love_hug",
        title: "Hug",
        url: "https://media.giphy.com/media/42YlR8u9gV5Cw/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "love_miss_you",
        title: "Miss You",
        url: "https://media.giphy.com/media/26FLdmIp6wJr91JAI/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "love_cute",
        title: "Cute",
        url: "https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "love_sparkle",
        title: "Sparkle",
        url: "https://media.giphy.com/media/3oriO6qJiXajN0TyDu/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "love_blush",
        title: "Blush",
        url: "https://media.giphy.com/media/3o6ZsYzyMklGIK9d2U/giphy.gif",
        mimeType: "image/gif",
      },
    ],
  },

  {
    id: "hello_goodbye",
    title: "Hello",
    icon: "👋",
    stickers: [
      {
        id: "hello_wave_1",
        title: "Hello",
        url: "https://media.giphy.com/media/3PAL5bChWnak0WJ32x/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "hello_wave_2",
        title: "Hi",
        url: "https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "hello_good_morning",
        title: "Morning",
        url: "https://media.giphy.com/media/l0MYEqEzwMWFCg8rm/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "hello_good_night",
        title: "Good Night",
        url: "https://media.giphy.com/media/3o6ZsVty4AbY88djtm/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "hello_bye",
        title: "Bye",
        url: "https://media.giphy.com/media/3o6Zt6ML6BklcajjsA/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "hello_see_you",
        title: "See You",
        url: "https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "hello_welcome",
        title: "Welcome",
        url: "https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "hello_back",
        title: "Back",
        url: "https://media.giphy.com/media/ASd0Ukj0y3qMM/giphy.gif",
        mimeType: "image/gif",
      },
    ],
  },

  {
    id: "funny_memes",
    title: "Funny",
    icon: "😂",
    stickers: [
      {
        id: "funny_laugh_1",
        title: "Laugh",
        url: "https://media.giphy.com/media/10JhviFuU2gWD6/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "funny_laugh_2",
        title: "LOL",
        url: "https://media.giphy.com/media/3o6ozvv0zsJskzOCbu/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "funny_rofl",
        title: "ROFL",
        url: "https://media.giphy.com/media/l0ExayQDzrI2xOb8A/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "funny_no_way",
        title: "No Way",
        url: "https://media.giphy.com/media/12XMGIWtrHBl5e/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "funny_confused",
        title: "Confused",
        url: "https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "funny_what",
        title: "What",
        url: "https://media.giphy.com/media/ghuvaCOI6GOoTX0RmH/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "funny_run",
        title: "Run",
        url: "https://media.giphy.com/media/3o7ZetIsjtbkgNE1I4/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "funny_fail",
        title: "Fail",
        url: "https://media.giphy.com/media/3o6Zt4HU9uwXmXSAuI/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "funny_hide",
        title: "Hide",
        url: "https://media.giphy.com/media/11s7Ke7jcNxCHS/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "funny_wait",
        title: "Wait",
        url: "https://media.giphy.com/media/3o7TKtnuHOHHUjR38Y/giphy.gif",
        mimeType: "image/gif",
      },
    ],
  },

  {
    id: "sad_cry",
    title: "Sad",
    icon: "🥺",
    stickers: [
      {
        id: "sad_cry_1",
        title: "Cry",
        url: "https://media.giphy.com/media/d2lcHJTG5Tscg/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "sad_cry_2",
        title: "Sad",
        url: "https://media.giphy.com/media/OPU6wzx8JrHna/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "sad_tears",
        title: "Tears",
        url: "https://media.giphy.com/media/9Y5BbDSkSTiY8/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "sad_lonely",
        title: "Lonely",
        url: "https://media.giphy.com/media/ISOckXUybVfQ4/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "sad_broken",
        title: "Broken",
        url: "https://media.giphy.com/media/3o6wrvdHFbwBrUFenu/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "sad_sorry",
        title: "Sorry",
        url: "https://media.giphy.com/media/l41YkxvU8c7J7Bba0/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "sad_tired",
        title: "Tired",
        url: "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "sad_need_hug",
        title: "Need Hug",
        url: "https://media.giphy.com/media/42YlR8u9gV5Cw/giphy.gif",
        mimeType: "image/gif",
      },
    ],
  },

  {
    id: "angry",
    title: "Angry",
    icon: "😡",
    stickers: [
      {
        id: "angry_1",
        title: "Angry",
        url: "https://media.giphy.com/media/11tTNkNy1SdXGg/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "angry_2",
        title: "Mad",
        url: "https://media.giphy.com/media/l0HlCqV35hdEg2GUo/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "angry_3",
        title: "No",
        url: "https://media.giphy.com/media/3ohhwNxuGh3gnyGG7S/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "angry_4",
        title: "Stop",
        url: "https://media.giphy.com/media/l0MYu38R0PPhIXe36/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "angry_5",
        title: "Serious",
        url: "https://media.giphy.com/media/3o7TKwmnDgQb5jemjK/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "angry_6",
        title: "Explode",
        url: "https://media.giphy.com/media/YA6dmVW0gfIw8/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "angry_7",
        title: "Leave Me",
        url: "https://media.giphy.com/media/3o7qE5866bLg4VKabe/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "angry_8",
        title: "Rage",
        url: "https://media.giphy.com/media/l0MYCzkjjMoGtK7rW/giphy.gif",
        mimeType: "image/gif",
      },
    ],
  },

  {
    id: "party",
    title: "Party",
    icon: "🎉",
    stickers: [
      {
        id: "party_1",
        title: "Party",
        url: "https://media.giphy.com/media/3o6fJ1BM7R2EBRDnxK/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "party_2",
        title: "Celebrate",
        url: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "party_3",
        title: "Dance",
        url: "https://media.giphy.com/media/GeimqsH0TLDt4tScGw/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "party_4",
        title: "Confetti",
        url: "https://media.giphy.com/media/26tOZ42Mg6pbTUPHW/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "party_5",
        title: "Congrats",
        url: "https://media.giphy.com/media/3oz9ZE2Oo9zRC/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "party_6",
        title: "Winner",
        url: "https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "party_7",
        title: "Cheers",
        url: "https://media.giphy.com/media/kyLYXonQYYfwYDIeZl/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "party_8",
        title: "Hooray",
        url: "https://media.giphy.com/media/3o6ZsYm5S6V6R9q5W0/giphy.gif",
        mimeType: "image/gif",
      },
    ],
  },

  {
    id: "anime_style",
    title: "Anime",
    icon: "🌸",
    stickers: [
      {
        id: "anime_happy",
        title: "Happy",
        url: "https://media.giphy.com/media/13Z5kstwARnPna/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "anime_love",
        title: "Love",
        url: "https://media.giphy.com/media/11sBLVxNs7v6WA/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "anime_cry",
        title: "Cry",
        url: "https://media.giphy.com/media/ROF8OQvDmxytW/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "anime_shy",
        title: "Shy",
        url: "https://media.giphy.com/media/OpfkuToK5gSHK/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "anime_angry",
        title: "Angry",
        url: "https://media.giphy.com/media/12q7JyfK1UolW0/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "anime_wow",
        title: "Wow",
        url: "https://media.giphy.com/media/5VKbvrjxpVJCM/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "anime_thanks",
        title: "Thanks",
        url: "https://media.giphy.com/media/3o7abB06u9bNzA8lu8/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "anime_sleep",
        title: "Sleep",
        url: "https://media.giphy.com/media/3o6ZsVty4AbY88djtm/giphy.gif",
        mimeType: "image/gif",
      },
    ],
  },

  {
    id: "gaming",
    title: "Gaming",
    icon: "🎮",
    stickers: [
      {
        id: "gaming_win",
        title: "Win",
        url: "https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "gaming_gg",
        title: "GG",
        url: "https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "gaming_ready",
        title: "Ready",
        url: "https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "gaming_focus",
        title: "Focus",
        url: "https://media.giphy.com/media/3o7TKwmnDgQb5jemjK/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "gaming_fail",
        title: "Fail",
        url: "https://media.giphy.com/media/3o6Zt4HU9uwXmXSAuI/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "gaming_fire",
        title: "Fire",
        url: "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "gaming_clap",
        title: "Clap",
        url: "https://media.giphy.com/media/l3q2XhfQ8oCkm1Ts4/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "gaming_power",
        title: "Power",
        url: "https://media.giphy.com/media/3oriO6qJiXajN0TyDu/giphy.gif",
        mimeType: "image/gif",
      },
    ],
  },

  {
    id: "food",
    title: "Food",
    icon: "🍕",
    stickers: [
      {
        id: "food_pizza",
        title: "Pizza",
        url: "https://media.giphy.com/media/4ayiIWaq2VULC/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "food_coffee",
        title: "Coffee",
        url: "https://media.giphy.com/media/687qS11pXwjCM/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "food_cake",
        title: "Cake",
        url: "https://media.giphy.com/media/3oEhmNLxk9uiTbL9Be/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "food_burger",
        title: "Burger",
        url: "https://media.giphy.com/media/3o7btUDtnx3gTwIlmo/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "food_icecream",
        title: "Ice Cream",
        url: "https://media.giphy.com/media/3o6ZsYm5S6V6R9q5W0/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "food_hungry",
        title: "Hungry",
        url: "https://media.giphy.com/media/12uXi1GXBibALC/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "food_yummy",
        title: "Yummy",
        url: "https://media.giphy.com/media/1ktwfTjwaQzde/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "food_tea",
        title: "Tea",
        url: "https://media.giphy.com/media/26xBwdIuRJiAIqHwA/giphy.gif",
        mimeType: "image/gif",
      },
    ],
  },

  {
    id: "daily_words",
    title: "Words",
    icon: "💬",
    stickers: [
      {
        id: "word_yes",
        title: "Yes",
        url: "https://media.giphy.com/media/111ebonMs90YLu/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "word_no",
        title: "No",
        url: "https://media.giphy.com/media/3ohhwNxuGh3gnyGG7S/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "word_ok",
        title: "OK",
        url: "https://media.giphy.com/media/3o6Zt8MgUuvSbkZYWc/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "word_thanks",
        title: "Thanks",
        url: "https://media.giphy.com/media/3oz8xIsloV7zOmt81G/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "word_sorry",
        title: "Sorry",
        url: "https://media.giphy.com/media/l41YkxvU8c7J7Bba0/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "word_welcome",
        title: "Welcome",
        url: "https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "word_wait",
        title: "Wait",
        url: "https://media.giphy.com/media/3o7TKtnuHOHHUjR38Y/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "word_good_luck",
        title: "Good Luck",
        url: "https://media.giphy.com/media/3ohzdIuqJoo8QdKlnW/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "word_congrats",
        title: "Congrats",
        url: "https://media.giphy.com/media/3oz9ZE2Oo9zRC/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "word_love_you",
        title: "Love You",
        url: "https://media.giphy.com/media/l4Ki4biBSwhjyrS48/giphy.gif",
        mimeType: "image/gif",
      },
    ],
  },

  {
    id: "emoji_faces",
    title: "Faces",
    icon: "😀",
    stickers: [
      {
        id: "face_smile",
        title: "Smile",
        url: "https://media.giphy.com/media/111ebonMs90YLu/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "face_wow",
        title: "Wow",
        url: "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "face_laugh",
        title: "Laugh",
        url: "https://media.giphy.com/media/10JhviFuU2gWD6/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "face_cry",
        title: "Cry",
        url: "https://media.giphy.com/media/d2lcHJTG5Tscg/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "face_angry",
        title: "Angry",
        url: "https://media.giphy.com/media/11tTNkNy1SdXGg/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "face_shy",
        title: "Shy",
        url: "https://media.giphy.com/media/OpfkuToK5gSHK/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "face_sleep",
        title: "Sleep",
        url: "https://media.giphy.com/media/3o6ZsVty4AbY88djtm/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "face_confused",
        title: "Confused",
        url: "https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "face_cool",
        title: "Cool",
        url: "https://media.giphy.com/media/3o7TKuylrX8kT7XhVS/giphy.gif",
        mimeType: "image/gif",
      },
      {
        id: "face_scream",
        title: "Scream",
        url: "https://media.giphy.com/media/5VKbvrjxpVJCM/giphy.gif",
        mimeType: "image/gif",
      },
    ],
  },
];