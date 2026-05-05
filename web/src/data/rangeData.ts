// Vendored from https://github.com/Tevyn/poker-math (src/data/rangeData.ts).
// Imported as-is — modifications go in `rangeLibrary.ts`.
import { RangeCategories, PokerRange } from './rangeTypes';

export const rangeData: RangeCategories = {
  "open_raises": {
    "name": "Open Raises",
    "ranges": {
      "lj_open": {
        "name": "LJ open",
        "range": {
            "raise": ["77","88","99","ATs","A9s","AJs","AQs","AKs","AA","A5s","KTs","KJs","KQs","KK","AKo","QJs","QQ","QTs","AQo","JJ","JTs","TT","T9s"]
        }
      },
      "hj_open": {
        "name": "HJ open",
        "range": {
          "raise": ["55","66","77","88","99","AA","AKs","AQs","AJs","ATs","A9s","A8s","A7s","A6s","A5s","A4s","A3s","A2s","K9s","KTs","KJs","KQs","KK","AKo","Q9s","QTs","QJs","QQ","KQo","AQo","AJo","JJ","JTs","J9s","TT","T9s","T8s","98s","97s","87s","76s"]
        }
      },
      "co_open": {
        "name": "CO open",
        "range": {
          "raise": ["44","55","66","77","88","99","A2s","A3s","A4s","A5s","A6s","A7s","A8s","A9s","ATs","AJs","AQs","AKs","AA","AKo","KK","KQs","KJs","KTs","K9s","K8s","Q9s","QTs","QJs","QQ","KQo","AQo","J9s","JTs","JJ","QJo","KJo","AJo","KTo","ATo","A9o","TT","T9s","T8s","98s","97s","87s","86s","76s","75s","65s","54s"]
        }
      },
      "btn_open": {
        "name": "BTN open",
        "range": {
          "raise": ["22","33","44","55","66","77","88","99","A2s","A3s","A4s","A5s","A6s","A7s","A8s","A9s","ATs","AJs","AQs","AKs","AA","AKo","KK","KQs","KJs","KTs","K9s","K8s","K7s","K6s","K5s","K4s","K3s","K2s","Q5s","Q6s","Q7s","Q8s","Q9s","QTs","QJs","QQ","KQo","AQo","J6s","J7s","J8s","J9s","JTs","JJ","QJo","KJo","AJo","T6s","T7s","T8s","T9s","TT","JTo","QTo","KTo","ATo","96s","97s","98s","T9o","J9o","Q9o","K9o","A9o","K8o","A7o","A8o","A6o","98o","87s","86s","85s","76s","75s","65s","64s","54s","43s"]
        }
      },
      "sb_open": {
        "name": "SB open",
        "range": {
          "raise": ["22","33","44","55","66","77","88","99","A2s","A3s","A4s","A5s","A6s","A7s","A8s","A9s","ATs","AJs","AQs","AKs","AA","AKo","KK","KQs","KJs","KTs","K9s","K8s","K7s","K6s","K5s","K4s","K3s","K2s","Q4s","Q5s","Q6s","Q7s","Q8s","Q9s","QTs","QJs","QQ","KQo","AQo","J5s","J6s","J7s","J8s","J9s","JTs","JJ","QJo","KJo","AJo","T6s","T7s","T8s","T9s","TT","JTo","QTo","KTo","ATo","96s","97s","98s","T9o","J9o","Q9o","K9o","A9o","85s","86s","87s","98o","75s","76s","65s","54s","A4o","A5o","A6o","A7o","A8o","Q8o","K8o"]
        }
      }
    }
  },
  "vs_lj": {
    "name": "vs. LJ",
    "ranges": {
      "hj_vs_lj": {
        "name": "HJ vs LJ",
        "range": {
          "raise": ["A5s","A4s","65s","TT","JJ","QQ","KK","AA","ATs","AJs","AQs","AKs","KTs","KJs","KQs","AKo","KQo","AQo","65s"]
        }
      },
      "co_vs_lj": {
        "name": "CO vs LJ",
        "range": {
          "raise": ["ATs","AJs","AQs","AKs","AA","KTs","KJs","KQs","KK","AKo","A5s","A4s","A3s","QJs","QQ","KQo","AQo","JJ","TT","65s"]
        }
      },
      "btn_vs_lj": {
        "name": "BTN vs LJ",
        "range": {
          "raise": ["99","A5s","A4s","A3s","A7s","ATs","AJs","AQs","AKs","AA","KJs","KQs","KK","AKo","QJs","QQ","KQo","AQo","JJ","TT","65s"]
        }
      },
      "sb_vs_lj": {
        "name": "SB vs LJ",
        "range": {
          "raise": ["99","ATs","AJs","AQs","AKs","AA","KTs","KJs","KQs","KK","AKo","QQ","QJs","AQo","A5s","A4s","JJ","TT","65s"]
        }
      },
      "bb_vs_lj": {
        "name": "BB vs LJ",
        "range": {
          "raise": ["JTs","QTs","KTs","ATs","QJs","KJs","AJs","QQ","KQs","AQs","KK","AKs","AA","AKo","AQo"],
          "call": ["22","33","44","55","66","77","88","99","A9s","A8s","A7s","A6s","A5s","A4s","A3s","A2s","K5s","K6s","K7s","K8s","K9s","Q8s","Q9s","J8s","J9s","KQo","KJo","AJo","ATo","JJ","TT","T7s","T8s","T9s","98s","97s","87s","86s","76s","75s","65s","64s","54s","53s","43s"]
      }
      }
    }
  },
  "vs_hj": {
    "name": "vs. HJ",
    "ranges": {
      "co_vs_hj": {
        "name": "CO vs HJ",
        "range": {
          "raise": ["99","A9s","ATs","AJs","AQs","AKs","AA","KTs","KJs","KQs","KK","AKo","QJs","QQ","KQo","AQo","AJo","JJ","TT","A5s","A4s","A3s"]
        }
      },
      "btn_vs_hj": {
        "name": "BTN vs HJ",
        "range": {
          "raise": ["88","99","A9s","ATs","AJs","AQs","AKs","AA","A7s","A5s","A4s","A3s","KTs","KJs","KQs","KK","AKo","QTs","QJs","QQ","KQo","AQo","AJo","JJ","TT"]
        }
      },
      "sb_vs_hj": {
        "name": "SB vs HJ",
        "range": {
          "raise": ["99","ATs","AJs","AQs","AKs","AA","KTs","KJs","KQs","KK","AKo","QTs","QJs","QQ","KQo","AQo","JTs","JJ","TT","A5s","A4s"]
        }
      },
      "bb_vs_hj": {
        "name": "BB vs HJ",
        "range": {
          "raise": ["ATs","AJs","AQs","AKs","AA","KTs","KJs","KQs","KK","AKo","QTs","QJs","QQ","KQo","AQo","JTs","JJ","T9s"],
          "call": ["22","33","44","55","66","77","88","99","A9s","A8s","A7s","A6s","A5s","A4s","A3s","A2s","K9s","K8s","K7s","K6s","K5s","K4s","Q8s","Q9s","J8s","J9s","QJo","KJo","AJo","ATo","TT","T8s","T7s","98s","97s","96s","87s","86s","76s","75s","65s","64s","54s","53s","43s"]
      }
      }
    }
  },
  "vs_co": {
    "name": "vs. CO",
    "ranges": {
      "btn_vs_co": {
        "name": "BTN vs CO",
        "range": {
          "raise": ["88","99","A5s","A4s","A3s","A7s","A8s","A9s","ATs","AJs","AQs","AKs","AA","K9s","KTs","KJs","KQs","KK","AKo","QTs","QJs","QQ","KQo","AQo","JTs","JJ","TT","KJo","AJo","ATo"]
        }
      },
      "sb_vs_co": {
        "name": "SB vs CO",
        "range": {
          "raise": ["88","99","A9s","ATs","AJs","AQs","AKs","AA","K9s","KTs","KJs","KQs","KK","AKo","QTs","QJs","QQ","KQo","AQo","JTs","JJ","TT","A5s","A4s","AJo"]
        }
      },
      "bb_vs_co": {
        "name": "BB vs CO",
        "range": {
          "raise": ["A9s","ATs","AJs","AQs","AKs","AA","KTs","KJs","KQs","KK","AKo","QTs","QJs","QQ","KQo","AQo","AJo","JJ","JTs","TT","T9s"],
          "call": ["22","33","44","55","66","77","88","99","A8s","A7s","A6s","A5s","A4s","A3s","A2s","K3s","K4s","K5s","K6s","K7s","K8s","K9s","Q9s","Q8s","Q7s","Q6s","Q5s","Q4s","J7s","J8s","J9s","QJo","KJo","JTo","QTo","KTo","ATo","A9o","98s","97s","96s","87s","86s","76s","75s","65s","64s","54s","53s","43s","T8s","T7s"]
      }
      }
    }
  },
  "vs_btn": {
    "name": "vs. BTN",
    "ranges": {
      "sb_vs_btn": {
        "name": "SB vs BTN",
        "range": {
          "raise": ["77","88","99","A9s","ATs","AJs","AQs","AKs","AA","A5s","A4s","K9s","KTs","KJs","KQs","KK","AKo","QTs","QJs","QQ","KQo","AQo","KJo","AJo","ATo","JTs","J9s","T9s","JJ","TT"]
        }
      },
      "bb_vs_btn": {
        "name": "BB vs BTN",
        "range": {
          "raise": ["88","99","A8s","A9s","ATs","AJs","AQs","AKs","AA","A5s","A4s","K9s","KTs","KJs","KQs","KK","AKo","Q9s","QTs","QJs","QQ","KQo","AQo","J9s","JTs","JJ","T9s","TT","KJo","AJo","ATo"],
          "call": ["22","33","44","55","66","77","A7s","A6s","A3s","A2s","K8s","K7s","K6s","K5s","K4s","K3s","K2s","Q8s","Q7s","Q6s","Q5s","Q4s","Q3s","Q2s","J4s","J5s","J6s","J7s","J8s","T6s","T7s","T8s","T9o","J9o","JTo","QTo","KTo","QJo","K9o","A9o","A8o","A7o","A5o","98s","97s","96s","87s","86s","85s","75s","76s","65s","64s","54s","53s","43s"]
      }
      }
    }
  },
  "vs_sb": {
    "name": "vs. SB",
    "ranges": {
      "bb_vs_sb": {
        "name": "BB vs SB",
        "range": {
          "raise": ["77","88","99","AA","AKs","AQs","AJs","ATs","A9s","A8s","A7s","A6s","A5s","A4s","A3s","A2s","K9s","KTs","KJs","KQs","KK","AKo","Q9s","QTs","QJs","QQ","KQo","AQo","J9s","JTs","JJ","QJo","KJo","AJo","ATo","TT","T9s","T8s","98s","97s","T8o","87s","86s","76s","65s","54s"],
          "call": ["22","33","44","55","66","K8s","K7s","K6s","K5s","K4s","K3s","K2s","Q2s","Q3s","Q4s","Q5s","Q6s","Q7s","Q8s","J8s","J7s","J6s","J5s","J4s","J3s","J2s","A9o","A8o","A7o","A6o","A5o","A4o","A3o","K8o","K9o","KTo","QTo","JTo","T9o","J9o","Q9o","85s","75s","74s","43s","53s","52s","63s","64s"]
      }
      }
    }
  },
  "iso_raising": {
    "name": "Iso-raising",
    "ranges": {
      "hj_iso_raise": {
        "name": "HJ iso-raise",
        "range": {
          "raise": ["88","99","ATs","AJs","AQs","AKs","AA","KJs","KQs","KK","AKo","AQo","QQ","QJs","JJ","TT"]
        }
      },
      "co_iso_raise": {
        "name": "CO iso-raise",
        "range": {
          "raise": ["77","88","99","A5s","A4s","A9s","ATs","AJs","AQs","AKs","AA","KTs","KJs","KQs","KK","AKo","QTs","QJs","QQ","KQo","AQo","AJo","JJ","JTs","TT","T9s"]
        }
      },
      "btn_iso_raise": {
        "name": "BTN iso-raise",
        "range": {
          "raise": ["77","88","99","A8s","A9s","ATs","AJs","AQs","AKs","AA","A5s","A4s","K9s","KTs","KJs","KQs","KK","AKo","QTs","QJs","QQ","KQo","AQo","AJo","JJ","JTs","J9s","TT","T9s","98s","87s"]
        }
      },
      "sb_bb_iso_raise": {
        "name": "SB & BB iso-raise",
        "range": {
          "raise": ["99","AJs","AQs","AKs","AA","KQs","KK","AKo","AQo","QQ","JJ","TT"]
        }
      }
    }
  },
  "facing_3bet": {
    "name": "4-bet or call",
    "ranges": {
      "4bet_lj_hj_oop": {
        "name": "LJ & HJ OOP",
        "range": {
          "raise": ["AQs","AKs","AA","KK","AKo","QQ"],
          "call": ["88","99","JJ","KQs","KJs","KTs","AJs","ATs","A5s","AQo","JTs","TT"]
        }
      },
      "4bet_lj_hj_ip": {
        "name": "LJ & HJ IP",
        "range": {
          "raise": ["AQs","AKs","AA","KQs","KK","AKo"],
          "call": ["77","88","99","AJs","KJs","QJs","JJ","TT","JTs","QTs","KTs","ATs","A5s","A4s","QQ","AQo","T9s"]
        }
      },
      "4bet_co_oop": {
        "name": "CO OOP",
        "range": {
          "raise": ["AQs","AKs","AA","KK","AKo","AQo","QQ"],
          "call": ["55","66","77","88","99","AJs","ATs","A9s","A8s","A5s","A4s","KQs","KJs","KTs","K9s","QJs","QTs","JTs","JJ","J9s","TT","T9s","87s","76s","65s","54s"]
        }
      },
      "4bet_co_ip": {
        "name": "CO IP",
        "range": {
          "raise": ["AQs","AKs","AA","KK","AKo"],
          "call": ["66","77","88","99","AJs","ATs","A9s","A5s","A4s","A3s","AQo","KQs","QQ","KJs","KTs","QJs","QTs","JJ","JTs","J9s","TT","T9s","98s","87s","76s","65s"]
        }
      },
      "4bet_btn": {
        "name": "BTN",
        "range": {
          "raise": ["AJs","AQs","AKs","AA","KQs","KK","AKo","QQ"],
          "call": ["22","33","44","55","66","77","88","99","ATs","A9s","A8s","A7s","A5s","A4s","A3s","KQo","AQo","AJo","KJs","KTs","K9s","Q9s","QTs","QJs","JJ","JTs","J9s","J8s","TT","T9s","T8s","98s","87s","76s","65s","54s"]
        }
      },
      "4bet_sb": {
        "name": "SB",
        "range": {
          "raise": ["AJs","AQs","AKs","AA","KQs","KK","AKo","AQo","QQ","JJ"],
          "call": ["44","55","66","77","88","99","ATs","A9s","A8s","A7s","A6s","A5s","A4s","A3s","A2s","KJs","KTs","K9s","K8s","K7s","K6s","Q9s","QTs","QJs","KQo","AJo","JTs","J9s","TT","T9s","T8s","98s","97s","87s","76s","65s","54s"]
        }
      }
    }
  }
};

// Helper function to get all available category IDs
export const getCategoryIds = (): string[] => {
  return Object.keys(rangeData);
};

// Helper function to get all available range IDs for a category
export const getRangeIds = (categoryId: string): string[] => {
  const category = rangeData[categoryId];
  return category ? Object.keys(category.ranges) : [];
};

// Helper function to get a specific range
export const getRange = (categoryId: string, rangeId: string) => {
  const category = rangeData[categoryId];
  if (!category) return null;
  
  const range = category.ranges[rangeId];
  return range || null;
};

// Helper function to get action for a hand from a range
export const getHandAction = (range: PokerRange, hand: string): string => {
  if (range.raise && range.raise.includes(hand)) return 'raise';
  if (range.call && range.call.includes(hand)) return 'call';
  return 'fold';
};

// Helper function to convert range to hand->action mapping
export const rangeToHandActionMap = (range: PokerRange): Record<string, string> => {
  const handActionMap: Record<string, string> = {};
  
  if (range.raise) {
    range.raise.forEach((hand: string) => {
      handActionMap[hand] = 'raise';
    });
  }
  
  if (range.call) {
    range.call.forEach((hand: string) => {
      handActionMap[hand] = 'call';
    });
  }
  
  return handActionMap;
};
