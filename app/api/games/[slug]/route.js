import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongodb";
import PricingConfig from "@/models/PricingConfig";
import { unstable_cache } from 'next/cache';

const ALLOWED_GAME_SLUGS = [
  "mobile-legends988",
  "mlbb-double332",
  "sgmy-mlbb893",
  "magic-chess-gogo-india924",
  "mlbb-indo42",
  "mlbb-russia953",
  "pubg-mobile138",
  "genshin-impact742",
  "honor-of-kings57",
  "wuthering-of-waves464",
  "where-winds-meet280",
  "mlbb-smallphp980",
  "weeklymonthly-bundle931",
];

const getCachedPricingConfig = unstable_cache(
  async (role) => {
    await connectDB();
    return await PricingConfig.findOne({ userType: role }).lean();
  },
  ['pricing-config'],
  { revalidate: 300 }
);

/* ================= MEMBERSHIP CONFIG ================= */
const MEMBERSHIPS = {
  "silver-membership": {
    gameName: "Silver Membership",
    gameFrom: "Your Platform",
    gameImageId: {
      image: "/membership/silver-m.png",
    },
    gameDescription: "Unlock premium pricing and basic benefits.",
    inputFieldOne: "User Email / Phone",
    inputFieldTwoOption: [],
    isValidationRequired: false,
    gameAvailablity: true,
    itemId: [
      {
        itemName: "1 Month",
        itemSlug: "silver-1m",
        sellingPrice: 99,
        dummyPrice: 299,
        itemAvailablity: true,
        index: 1,
        itemImageId: {
          image: "/membership/silver-m.png",
        },
      },
      {
        itemName: "3 Month",
        itemSlug: "silver-3m",
        sellingPrice: 299,
        dummyPrice: 1099,
        itemAvailablity: true,
        index: 3,
        itemImageId: {
          image: "/membership/silver-m.png",
        },
      },
    ],
  },

  "reseller-membership": {
    gameName: "Reseller Membership",
    gameFrom: "Your Platform",
    gameImageId: {
      image: "/membership/reseller-m.png",
    },
    gameDescription: "Get reseller pricing, bulk access & dashboard.",
    inputFieldOne: "User Email / Phone",
    inputFieldTwoOption: [],
    isValidationRequired: false,
    gameAvailablity: true,
    itemId: [
      {
        itemName: "1 Month",
        itemSlug: "reseller-1m",
        sellingPrice: 99,
        dummyPrice: 299,
        itemAvailablity: true,
        index: 1,
        itemImageId: {
          image: "/membership/reseller-m.png",
        },
      },
      {
        itemName: "3 Month",
        itemSlug: "reseller-3m",
        sellingPrice: 299,
        dummyPrice: 1099,
        itemAvailablity: true,
        index: 3,
        itemImageId: {
          image: "/membership/reseller-m.png",
        },
      },
    ],
  },
};

/* ================= OTT CONFIG ================= */
const OTTS = {
  "youtube-premium": {
    gameName: "YouTube Premium",
    gameFrom: "Google",
    gameImageId: {
      image: "/ott/youtube.webp",
    },
    gameDescription: "Ad-free YouTube, background play, YouTube Music.",
    inputFieldOne: "Email / Phone",
    inputFieldTwoOption: [],
    isValidationRequired: true,
    gameAvailablity: true,
    itemId: [
      {
        itemName: "1 Month",
        itemSlug: "yt-1m",
        sellingPrice: 30,
        dummyPrice: 199,
        itemAvailablity: true,
        index: 1,
        itemImageId: {
          image: "/ott/youtube.webp",
        },
      },
      {
        itemName: "3 Months",
        itemSlug: "yt-3m",
        sellingPrice: 90,
        dummyPrice: 499,
        itemAvailablity: true,
        index: 2,
        itemImageId: {
          image: "/ott/youtube.webp",
        },
      },
    ],
  },

  netflix: {
    gameName: "Netflix",
    gameFrom: "Netflix Inc.",
    gameImageId: {
      image: "/ott/netflix.webp",
    },
    gameDescription: "Movies & series streaming subscription.",
    inputFieldOne: "Account Email",
    inputFieldTwoOption: [],
    isValidationRequired: true,
    gameAvailablity: true,
    itemId: [
      {
        itemName: "1 Month",
        itemSlug: "nf-1m",
        sellingPrice: 99,
        dummyPrice: 299,
        itemAvailablity: true,
        index: 1,
        itemImageId: {
          image: "/ott/netflix.webp",
        },
      },
      {
        itemName: "3 Months",
        itemSlug: "nf-3m",
        sellingPrice: 249,
        dummyPrice: 799,
        itemAvailablity: true,
        index: 2,
        itemImageId: {
          image: "/ott/netflix.webp",
        },
      },
    ],
  },

  spotify: {
    gameName: "Spotify Premium",
    gameFrom: "Spotify",
    gameImageId: {
      image: "/ott/spotify.webp",
    },
    gameDescription: "Ad-free music streaming.",
    inputFieldOne: "Account Email",
    inputFieldTwoOption: [],
    isValidationRequired: true,
    gameAvailablity: true,
    itemId: [
      {
        itemName: "1 Month",
        itemSlug: "sp-1m",
        sellingPrice: 119,
        dummyPrice: 299,
        itemAvailablity: true,
        index: 1,
        itemImageId: {
          image: "/ott/spotify.webp",
        },
      },
      {
        itemName: "3 Months",
        itemSlug: "sp-3m",
        sellingPrice: 299,
        dummyPrice: 599,
        itemAvailablity: true,
        index: 2,
        itemImageId: {
          image: "/ott/spotify.webp",
        },
      },
    ],
  },
};

/* ================= ROLE → PRICING (FIXED) ================= */
const resolvePricingRole = (role) => {
  if (["user", "member", "admin"].includes(role)) return role;
  return null; // owner → base price
};

/* ================= API ================= */
export async function GET(req, { params }) {
  const { slug } = await params;

  try {
    /* ===== STATIC PRODUCTS ===== */
    if (OTTS[slug]) {
      return NextResponse.json({
        success: true,
        data: { gameSlug: slug, ...OTTS[slug] },
      });
    }

    if (MEMBERSHIPS[slug]) {
      return NextResponse.json({
        success: true,
        data: { gameSlug: slug, ...MEMBERSHIPS[slug] },
      });
    }

    /* ===== OPTIONAL AUTH ===== */
    let userType = "user";
    const auth = req.headers.get("authorization");

    if (auth?.startsWith("Bearer ")) {
      try {
        const decoded = jwt.verify(
          auth.split(" ")[1],
          process.env.JWT_SECRET
        );
        if (decoded?.userType) userType = decoded.userType;
      } catch { }
    }

    const pricingRole = resolvePricingRole(userType);

    /* ===== FETCH BASE GAME ===== */
    if (!ALLOWED_GAME_SLUGS.includes(slug)) {
      return NextResponse.json(
        { success: false, message: "Game not found or restricted" },
        { status: 404 }
      );
    }

    const response = await fetch(
      `https://game-off-ten.vercel.app/api/v1/game/${slug}`,
      {
        headers: { "x-api-key": process.env.API_SECRET_KEY },
        next: { revalidate: 300 } // Cache for 5 minutes
      }
    );

    const data = await response.json();
    if (!data?.data?.itemId) return NextResponse.json(data);

    /* ===== FETCH PRICING ===== */
    let pricingConfig = null;
    if (pricingRole) {
      pricingConfig = await getCachedPricingConfig(pricingRole);
    }

    /* ===== APPLY PRICING ===== */
    const gameSlug = data.data.gameSlug;

    data.data.itemId = data.data.itemId.map((item) => {
      const basePrice = Number(item.sellingPrice);
      let finalPrice = basePrice;

      const override = pricingConfig?.overrides?.find(
        (o) =>
          o.gameSlug === gameSlug &&
          o.itemSlug === item.itemSlug
      );

      if (override?.fixedPrice != null) {
        finalPrice = override.fixedPrice;
      } else {
        const slab = pricingConfig?.slabs?.find(
          (s) => basePrice >= s.min && basePrice < s.max
        );
        if (slab) {
          finalPrice = basePrice * (1 + slab.percent / 100);
        }
      }

      return {
        ...item,
        sellingPrice: Math.ceil(finalPrice),
      };
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error("Game Fetch Error:", err);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}
