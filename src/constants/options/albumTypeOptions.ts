import { SelectOption } from "../../components/ui/FormSelect";

export const ALBUM_TYPE_OPTIONS: SelectOption[] = [
  // 🎵 Musique
  { key: "mini_album", label: "Mini Album" },
  { key: "full_album", label: "Album" },
  { key: "single", label: "Single" },
  { key: "digital_single", label: "Digital Single" },
  { key: "repackage", label: "Repackage" },
  { key: "compilation", label: "Compilation" },

  // 🎤 Events
  { key: "fanmeeting", label: "Fanmeeting" },
  { key: "fansign", label: "Fansign" },
  { key: "videocall", label: "Vidéocall" },
  { key: "showcase", label: "Showcase" },
  { key: "concert", label: "Concert" },
  { key: "tour", label: "Tour" },

  // 🎁 Merch
  { key: "season_greetings", label: "Season Greetings" },
  { key: "membership_kit", label: "Membership Kit" },
  { key: "kit_album", label: "Kit Album" },
  { key: "platform_album", label: "Platform Album" },
  { key: "jewel_case", label: "Jewel Case" },

  // 🎉 Spéciaux
  { key: "anniversary", label: "Anniversary" },
  { key: "collaboration", label: "Collaboration" },
  { key: "pop_up_store", label: "Pop-Up Store" },
  { key: "lucky_draw", label: "Lucky Draw" },

  // 📺 Médias
  { key: "photobook", label: "Photobook" },
  { key: "dvd", label: "DVD" },
  { key: "bluray", label: "Blu-ray" },
  { key: "ost", label: "OST" },

  { key: "event", label: "Event" },
];
