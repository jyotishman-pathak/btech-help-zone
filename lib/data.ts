/**
 * CEE Assam — Static Predictor Dataset (7 government colleges only)
 * ===================================================================
 * Source: cee_predictor_data_2000.csv (provided by you), filtered to
 * exactly the 7 colleges you named — AEC, JEC, JIST, BBEC, BVEC, DEC, GEC.
 * Royal Global University, Don Bosco University and GIMT (private colleges
 * present in the raw CSV) were deliberately dropped.
 *
 * 1,395 raw rows -> 333 college+branch+category combinations, each holding
 * the full Round 1 / 2 / 3 history across 2023, 2024 and 2025, PLUS a
 * computed `projection2026` block.
 *
 * ⚠️ ONE THING WORTH KNOWING ABOUT YOUR OWN CSV before you ship this:
 * Every one of the 7 colleges has rows for all 8 branches (CSE, ETE, EE,
 * Civil, Mech, Chemical, Instrumentation, Power Electronics). In reality,
 * smaller colleges like BVEC/BBEC/DEC/GEC only run 3-4 of these branches
 * (e.g. real BVEC = Civil/ETE/CSE/Mech only, no Chemical or Instrumentation).
 * So either this CSV is synthetic/test data, or DTE genuinely opened new
 * branches at these colleges recently. I used the file exactly as given —
 * just flagging it so you don't accidentally publish a branch that doesn't
 * exist at a particular college. Worth a manual sanity pass before go-live.
 *
 * HOW projection2026 WAS COMPUTED (my own modelling, not an official figure):
 * For each combo, I took the *final available round of each year* (closest
 * thing to a "settled" cutoff) across 2023/24/25, fit a simple linear trend
 * across however many years existed, and projected forward to 2026.
 *   - confidence: "high"  -> 3 years of data, trend moved the same direction
 *                            every year (consistent signal)
 *   - confidence: "medium"-> 2-3 years of data, but direction wasn't fully
 *                            consistent year-on-year
 *   - confidence: "low"   -> only 1 year of data existed, so this is a flat
 *                            carry-forward, not a real trend
 * trend: "tightening" = closing rank getting LOWER (harder to get in),
 *        "loosening"  = closing rank getting HIGHER (easier to get in),
 *        "stable"     = year-on-year movement under ~3%
 *
 * This is a model, not a DTE Assam announcement. Label it as "Projected"
 * in the UI, never as a confirmed cutoff — 2026 counselling hasn't run yet.
 *
 * Generated: 26 Jun 2026.
 */

export interface HistoricalRound {
  year: number;
  round: number;
  closingRank: number;
  openingRank: number | null;
  cutoffMarks: number | null;
}

export type ProjectionConfidence = "high" | "medium" | "low";
export type ProjectionTrend = "tightening" | "loosening" | "stable";

export interface Projection2026 {
  projectedClosingRank: number | null;
  projectedCutoffMarks: number | null;
  confidence: ProjectionConfidence;
  basisYears: number[];
  trend: ProjectionTrend;
}

export interface CategoryData {
  history: HistoricalRound[];
  projection2026: Projection2026;
}

export interface BranchData {
  branchName: string;
  categories: Record<string, CategoryData>;
}

export interface CollegeData {
  id: string;
  name: string;
  shortName: string;
  city: string;
  branches: BranchData[];
}

export const CEE_STATIC_DATA: CollegeData[] = [
  {
    "id": "AEC",
    "name": "Assam Engineering College",
    "shortName": "AEC",
    "city": "Guwahati",
    "branches": [
      {
        "branchName": "Computer Science and Engineering",
        "categories": {
          "General": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 52,
                "openingRank": 32,
                "cutoffMarks": 266
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 87,
                "openingRank": 44,
                "cutoffMarks": 243
              }
            ],
            "projection2026": {
              "projectedClosingRank": 87,
              "projectedCutoffMarks": 243,
              "confidence": "low",
              "basisYears": [
                2023
              ],
              "trend": "stable"
            }
          },
          "EWS": {
            "history": [
              {
                "year": 2023,
                "round": 3,
                "closingRank": 96,
                "openingRank": 40,
                "cutoffMarks": 246
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 93,
                "openingRank": 58,
                "cutoffMarks": 241
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 103,
                "openingRank": 31,
                "cutoffMarks": 240
              }
            ],
            "projection2026": {
              "projectedClosingRank": 104,
              "projectedCutoffMarks": 236,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "OBC/MOBC": {
            "history": [
              {
                "year": 2024,
                "round": 2,
                "closingRank": 106,
                "openingRank": 34,
                "cutoffMarks": 232
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 113,
                "openingRank": 51,
                "cutoffMarks": 230
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 102,
                "openingRank": 64,
                "cutoffMarks": 239
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 129,
                "openingRank": 76,
                "cutoffMarks": 230
              }
            ],
            "projection2026": {
              "projectedClosingRank": 145,
              "projectedCutoffMarks": 230,
              "confidence": "medium",
              "basisYears": [
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "SC": {
            "history": [
              {
                "year": 2024,
                "round": 2,
                "closingRank": 167,
                "openingRank": 79,
                "cutoffMarks": 219
              }
            ],
            "projection2026": {
              "projectedClosingRank": 167,
              "projectedCutoffMarks": 219,
              "confidence": "low",
              "basisYears": [
                2024
              ],
              "trend": "stable"
            }
          },
          "ST(P)": {
            "history": [
              {
                "year": 2023,
                "round": 3,
                "closingRank": 276,
                "openingRank": 101,
                "cutoffMarks": 194
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 179,
                "openingRank": 77,
                "cutoffMarks": 216
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 244,
                "openingRank": 103,
                "cutoffMarks": 200
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 199,
                "openingRank": 73,
                "cutoffMarks": 204
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 298,
                "openingRank": 150,
                "cutoffMarks": 192
              }
            ],
            "projection2026": {
              "projectedClosingRank": 295,
              "projectedCutoffMarks": 193,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "ST(H)": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 287,
                "openingRank": 112,
                "cutoffMarks": 190
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 349,
                "openingRank": 157,
                "cutoffMarks": 185
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 363,
                "openingRank": 142,
                "cutoffMarks": 188
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 427,
                "openingRank": 149,
                "cutoffMarks": 179
              }
            ],
            "projection2026": {
              "projectedClosingRank": 466,
              "projectedCutoffMarks": 176,
              "confidence": "medium",
              "basisYears": [
                2023,
                2025
              ],
              "trend": "loosening"
            }
          }
        }
      },
      {
        "branchName": "Electronics and Telecommunication Engineering",
        "categories": {
          "General": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 85,
                "openingRank": 31,
                "cutoffMarks": 242
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 98,
                "openingRank": 44,
                "cutoffMarks": 240
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 92,
                "openingRank": 59,
                "cutoffMarks": 244
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 124,
                "openingRank": 46,
                "cutoffMarks": 227
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 138,
                "openingRank": 39,
                "cutoffMarks": 223
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 90,
                "openingRank": 41,
                "cutoffMarks": 242
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 115,
                "openingRank": 38,
                "cutoffMarks": 233
              }
            ],
            "projection2026": {
              "projectedClosingRank": 134,
              "projectedCutoffMarks": 225,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "EWS": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 98,
                "openingRank": 55,
                "cutoffMarks": 239
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 98,
                "openingRank": 40,
                "cutoffMarks": 237
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 146,
                "openingRank": 63,
                "cutoffMarks": 227
              }
            ],
            "projection2026": {
              "projectedClosingRank": 242,
              "projectedCutoffMarks": 203,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024
              ],
              "trend": "loosening"
            }
          },
          "OBC/MOBC": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 115,
                "openingRank": 45,
                "cutoffMarks": 233
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 180,
                "openingRank": 108,
                "cutoffMarks": 209
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 125,
                "openingRank": 64,
                "cutoffMarks": 224
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 173,
                "openingRank": 85,
                "cutoffMarks": 217
              }
            ],
            "projection2026": {
              "projectedClosingRank": 214,
              "projectedCutoffMarks": 204,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "SC": {
            "history": [
              {
                "year": 2023,
                "round": 3,
                "closingRank": 344,
                "openingRank": 180,
                "cutoffMarks": 186
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 278,
                "openingRank": 118,
                "cutoffMarks": 194
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 334,
                "openingRank": 199,
                "cutoffMarks": 189
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 244,
                "openingRank": 86,
                "cutoffMarks": 200
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 326,
                "openingRank": 152,
                "cutoffMarks": 191
              }
            ],
            "projection2026": {
              "projectedClosingRank": 317,
              "projectedCutoffMarks": 194,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "stable"
            }
          },
          "ST(P)": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 349,
                "openingRank": 189,
                "cutoffMarks": 183
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 304,
                "openingRank": 188,
                "cutoffMarks": 188
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 365,
                "openingRank": 173,
                "cutoffMarks": 179
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 450,
                "openingRank": 130,
                "cutoffMarks": 176
              }
            ],
            "projection2026": {
              "projectedClosingRank": 469,
              "projectedCutoffMarks": 175,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "ST(H)": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 492,
                "openingRank": 311,
                "cutoffMarks": 169
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 411,
                "openingRank": 160,
                "cutoffMarks": 177
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 549,
                "openingRank": 206,
                "cutoffMarks": 165
              }
            ],
            "projection2026": {
              "projectedClosingRank": 541,
              "projectedCutoffMarks": 166,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          }
        }
      },
      {
        "branchName": "Electrical Engineering",
        "categories": {
          "General": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 109,
                "openingRank": 48,
                "cutoffMarks": 237
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 186,
                "openingRank": 103,
                "cutoffMarks": 212
              }
            ],
            "projection2026": {
              "projectedClosingRank": 224,
              "projectedCutoffMarks": 200,
              "confidence": "medium",
              "basisYears": [
                2023,
                2025
              ],
              "trend": "loosening"
            }
          },
          "EWS": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 137,
                "openingRank": 44,
                "cutoffMarks": 227
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 179,
                "openingRank": 69,
                "cutoffMarks": 217
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 136,
                "openingRank": 36,
                "cutoffMarks": 229
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 216,
                "openingRank": 90,
                "cutoffMarks": 201
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 161,
                "openingRank": 52,
                "cutoffMarks": 215
              }
            ],
            "projection2026": {
              "projectedClosingRank": 167,
              "projectedCutoffMarks": 209,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "tightening"
            }
          },
          "OBC/MOBC": {
            "history": [
              {
                "year": 2024,
                "round": 3,
                "closingRank": 278,
                "openingRank": 102,
                "cutoffMarks": 191
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 182,
                "openingRank": 105,
                "cutoffMarks": 211
              }
            ],
            "projection2026": {
              "projectedClosingRank": 86,
              "projectedCutoffMarks": 231,
              "confidence": "medium",
              "basisYears": [
                2024,
                2025
              ],
              "trend": "tightening"
            }
          },
          "SC": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 402,
                "openingRank": 138,
                "cutoffMarks": 180
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 303,
                "openingRank": 129,
                "cutoffMarks": 190
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 436,
                "openingRank": 143,
                "cutoffMarks": 174
              }
            ],
            "projection2026": {
              "projectedClosingRank": 504,
              "projectedCutoffMarks": 162,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024
              ],
              "trend": "loosening"
            }
          },
          "ST(P)": {
            "history": [
              {
                "year": 2023,
                "round": 3,
                "closingRank": 524,
                "openingRank": 213,
                "cutoffMarks": 167
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 415,
                "openingRank": 188,
                "cutoffMarks": 178
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 459,
                "openingRank": 150,
                "cutoffMarks": 172
              }
            ],
            "projection2026": {
              "projectedClosingRank": 329,
              "projectedCutoffMarks": 182,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024
              ],
              "trend": "tightening"
            }
          },
          "ST(H)": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 569,
                "openingRank": 223,
                "cutoffMarks": 161
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 671,
                "openingRank": 335,
                "cutoffMarks": 156
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 562,
                "openingRank": 362,
                "cutoffMarks": 164
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 700,
                "openingRank": 189,
                "cutoffMarks": 156
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 822,
                "openingRank": 208,
                "cutoffMarks": 144
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 591,
                "openingRank": 158,
                "cutoffMarks": 158
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 948,
                "openingRank": 408,
                "cutoffMarks": 139
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1091,
              "projectedCutoffMarks": 129,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          }
        }
      },
      {
        "branchName": "Civil Engineering",
        "categories": {
          "General": {
            "history": [
              {
                "year": 2025,
                "round": 3,
                "closingRank": 274,
                "openingRank": 149,
                "cutoffMarks": 194
              }
            ],
            "projection2026": {
              "projectedClosingRank": 274,
              "projectedCutoffMarks": 194,
              "confidence": "low",
              "basisYears": [
                2025
              ],
              "trend": "stable"
            }
          },
          "EWS": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 172,
                "openingRank": 92,
                "cutoffMarks": 216
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 250,
                "openingRank": 143,
                "cutoffMarks": 197
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 307,
                "openingRank": 136,
                "cutoffMarks": 192
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 263,
                "openingRank": 164,
                "cutoffMarks": 199
              }
            ],
            "projection2026": {
              "projectedClosingRank": 286,
              "projectedCutoffMarks": 198,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "stable"
            }
          },
          "OBC/MOBC": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 244,
                "openingRank": 107,
                "cutoffMarks": 204
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 276,
                "openingRank": 165,
                "cutoffMarks": 195
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 313,
                "openingRank": 106,
                "cutoffMarks": 186
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 271,
                "openingRank": 129,
                "cutoffMarks": 195
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 358,
                "openingRank": 211,
                "cutoffMarks": 188
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 250,
                "openingRank": 131,
                "cutoffMarks": 200
              }
            ],
            "projection2026": {
              "projectedClosingRank": 244,
              "projectedCutoffMarks": 205,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "tightening"
            }
          },
          "SC": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 463,
                "openingRank": 190,
                "cutoffMarks": 175
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 410,
                "openingRank": 155,
                "cutoffMarks": 177
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 663,
                "openingRank": 363,
                "cutoffMarks": 158
              }
            ],
            "projection2026": {
              "projectedClosingRank": 712,
              "projectedCutoffMarks": 153,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "ST(P)": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 605,
                "openingRank": 319,
                "cutoffMarks": 161
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 510,
                "openingRank": 287,
                "cutoffMarks": 169
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 624,
                "openingRank": 272,
                "cutoffMarks": 159
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 772,
                "openingRank": 444,
                "cutoffMarks": 149
              }
            ],
            "projection2026": {
              "projectedClosingRank": 834,
              "projectedCutoffMarks": 144,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "ST(H)": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 701,
                "openingRank": 317,
                "cutoffMarks": 153
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 936,
                "openingRank": 541,
                "cutoffMarks": 141
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 729,
                "openingRank": 236,
                "cutoffMarks": 155
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 1014,
                "openingRank": 469,
                "cutoffMarks": 136
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 1133,
                "openingRank": 375,
                "cutoffMarks": 127
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1232,
              "projectedCutoffMarks": 120,
              "confidence": "medium",
              "basisYears": [
                2023,
                2025
              ],
              "trend": "loosening"
            }
          }
        }
      },
      {
        "branchName": "Mechanical Engineering",
        "categories": {
          "General": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 173,
                "openingRank": 95,
                "cutoffMarks": 215
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 234,
                "openingRank": 136,
                "cutoffMarks": 203
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 181,
                "openingRank": 97,
                "cutoffMarks": 215
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 195,
                "openingRank": 85,
                "cutoffMarks": 215
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 257,
                "openingRank": 156,
                "cutoffMarks": 195
              }
            ],
            "projection2026": {
              "projectedClosingRank": 247,
              "projectedCutoffMarks": 196,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "EWS": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 197,
                "openingRank": 73,
                "cutoffMarks": 207
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 214,
                "openingRank": 69,
                "cutoffMarks": 201
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 246,
                "openingRank": 86,
                "cutoffMarks": 205
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 265,
                "openingRank": 80,
                "cutoffMarks": 198
              }
            ],
            "projection2026": {
              "projectedClosingRank": 293,
              "projectedCutoffMarks": 193,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "OBC/MOBC": {
            "history": [
              {
                "year": 2023,
                "round": 3,
                "closingRank": 313,
                "openingRank": 154,
                "cutoffMarks": 191
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 239,
                "openingRank": 69,
                "cutoffMarks": 201
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 232,
                "openingRank": 116,
                "cutoffMarks": 199
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 311,
                "openingRank": 195,
                "cutoffMarks": 188
              }
            ],
            "projection2026": {
              "projectedClosingRank": 286,
              "projectedCutoffMarks": 190,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "stable"
            }
          },
          "SC": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 433,
                "openingRank": 270,
                "cutoffMarks": 171
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 536,
                "openingRank": 159,
                "cutoffMarks": 163
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 386,
                "openingRank": 224,
                "cutoffMarks": 179
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 473,
                "openingRank": 240,
                "cutoffMarks": 170
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 569,
                "openingRank": 304,
                "cutoffMarks": 165
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 659,
                "openingRank": 391,
                "cutoffMarks": 154
              }
            ],
            "projection2026": {
              "projectedClosingRank": 679,
              "projectedCutoffMarks": 153,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "ST(P)": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 470,
                "openingRank": 139,
                "cutoffMarks": 173
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 677,
                "openingRank": 169,
                "cutoffMarks": 158
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 705,
                "openingRank": 408,
                "cutoffMarks": 152
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 877,
                "openingRank": 290,
                "cutoffMarks": 141
              }
            ],
            "projection2026": {
              "projectedClosingRank": 953,
              "projectedCutoffMarks": 133,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "ST(H)": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 657,
                "openingRank": 180,
                "cutoffMarks": 160
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 1037,
                "openingRank": 425,
                "cutoffMarks": 133
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 803,
                "openingRank": 507,
                "cutoffMarks": 153
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 927,
                "openingRank": 293,
                "cutoffMarks": 140
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1144,
              "projectedCutoffMarks": 124,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          }
        }
      },
      {
        "branchName": "Instrumentation Engineering",
        "categories": {
          "General": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 186,
                "openingRank": 65,
                "cutoffMarks": 216
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 269,
                "openingRank": 85,
                "cutoffMarks": 188
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 221,
                "openingRank": 69,
                "cutoffMarks": 208
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 228,
                "openingRank": 140,
                "cutoffMarks": 202
              }
            ],
            "projection2026": {
              "projectedClosingRank": 198,
              "projectedCutoffMarks": 213,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "tightening"
            }
          },
          "EWS": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 190,
                "openingRank": 59,
                "cutoffMarks": 214
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 285,
                "openingRank": 175,
                "cutoffMarks": 196
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 326,
                "openingRank": 97,
                "cutoffMarks": 187
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 270,
                "openingRank": 97,
                "cutoffMarks": 197
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 317,
                "openingRank": 108,
                "cutoffMarks": 193
              }
            ],
            "projection2026": {
              "projectedClosingRank": 405,
              "projectedCutoffMarks": 177,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "OBC/MOBC": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 228,
                "openingRank": 64,
                "cutoffMarks": 202
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 308,
                "openingRank": 171,
                "cutoffMarks": 193
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 322,
                "openingRank": 148,
                "cutoffMarks": 188
              }
            ],
            "projection2026": {
              "projectedClosingRank": 329,
              "projectedCutoffMarks": 186,
              "confidence": "medium",
              "basisYears": [
                2023,
                2025
              ],
              "trend": "stable"
            }
          },
          "SC": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 458,
                "openingRank": 148,
                "cutoffMarks": 174
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 623,
                "openingRank": 377,
                "cutoffMarks": 161
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 523,
                "openingRank": 175,
                "cutoffMarks": 166
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 659,
                "openingRank": 251,
                "cutoffMarks": 156
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 686,
                "openingRank": 337,
                "cutoffMarks": 156
              }
            ],
            "projection2026": {
              "projectedClosingRank": 817,
              "projectedCutoffMarks": 146,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "ST(P)": {
            "history": [
              {
                "year": 2023,
                "round": 3,
                "closingRank": 861,
                "openingRank": 286,
                "cutoffMarks": 147
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 615,
                "openingRank": 383,
                "cutoffMarks": 159
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 744,
                "openingRank": 343,
                "cutoffMarks": 158
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 952,
                "openingRank": 487,
                "cutoffMarks": 134
              }
            ],
            "projection2026": {
              "projectedClosingRank": 943,
              "projectedCutoffMarks": 133,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "ST(H)": {
            "history": [
              {
                "year": 2025,
                "round": 1,
                "closingRank": 842,
                "openingRank": 366,
                "cutoffMarks": 146
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 1167,
                "openingRank": 553,
                "cutoffMarks": 136
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 1383,
                "openingRank": 765,
                "cutoffMarks": 122
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1383,
              "projectedCutoffMarks": 122,
              "confidence": "low",
              "basisYears": [
                2025
              ],
              "trend": "stable"
            }
          }
        }
      }
    ]
  },
  {
    "id": "JEC",
    "name": "Jorhat Engineering College",
    "shortName": "JEC",
    "city": "Jorhat",
    "branches": [
      {
        "branchName": "Computer Science and Engineering",
        "categories": {
          "General": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 93,
                "openingRank": 30,
                "cutoffMarks": 241
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 127,
                "openingRank": 38,
                "cutoffMarks": 224
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 111,
                "openingRank": 67,
                "cutoffMarks": 237
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 142,
                "openingRank": 51,
                "cutoffMarks": 227
              }
            ],
            "projection2026": {
              "projectedClosingRank": 142,
              "projectedCutoffMarks": 232,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "EWS": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 153,
                "openingRank": 87,
                "cutoffMarks": 220
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 163,
                "openingRank": 71,
                "cutoffMarks": 220
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 113,
                "openingRank": 56,
                "cutoffMarks": 230
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 185,
                "openingRank": 98,
                "cutoffMarks": 210
              }
            ],
            "projection2026": {
              "projectedClosingRank": 229,
              "projectedCutoffMarks": 190,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024
              ],
              "trend": "loosening"
            }
          },
          "OBC/MOBC": {
            "history": [
              {
                "year": 2025,
                "round": 1,
                "closingRank": 155,
                "openingRank": 90,
                "cutoffMarks": 224
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 211,
                "openingRank": 66,
                "cutoffMarks": 205
              }
            ],
            "projection2026": {
              "projectedClosingRank": 211,
              "projectedCutoffMarks": 205,
              "confidence": "low",
              "basisYears": [
                2025
              ],
              "trend": "stable"
            }
          },
          "SC": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 252,
                "openingRank": 101,
                "cutoffMarks": 200
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 379,
                "openingRank": 96,
                "cutoffMarks": 185
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 261,
                "openingRank": 150,
                "cutoffMarks": 196
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 324,
                "openingRank": 95,
                "cutoffMarks": 192
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 399,
                "openingRank": 134,
                "cutoffMarks": 177
              }
            ],
            "projection2026": {
              "projectedClosingRank": 439,
              "projectedCutoffMarks": 161,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024
              ],
              "trend": "loosening"
            }
          },
          "ST(P)": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 338,
                "openingRank": 103,
                "cutoffMarks": 184
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 385,
                "openingRank": 226,
                "cutoffMarks": 180
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 379,
                "openingRank": 175,
                "cutoffMarks": 184
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 486,
                "openingRank": 273,
                "cutoffMarks": 169
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 358,
                "openingRank": 165,
                "cutoffMarks": 179
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 429,
                "openingRank": 166,
                "cutoffMarks": 176
              }
            ],
            "projection2026": {
              "projectedClosingRank": 477,
              "projectedCutoffMarks": 171,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "ST(H)": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 508,
                "openingRank": 192,
                "cutoffMarks": 165
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 631,
                "openingRank": 279,
                "cutoffMarks": 166
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 733,
                "openingRank": 429,
                "cutoffMarks": 156
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1183,
              "projectedCutoffMarks": 138,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024
              ],
              "trend": "loosening"
            }
          }
        }
      },
      {
        "branchName": "Electrical Engineering",
        "categories": {
          "General": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 274,
                "openingRank": 135,
                "cutoffMarks": 195
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 326,
                "openingRank": 166,
                "cutoffMarks": 188
              }
            ],
            "projection2026": {
              "projectedClosingRank": 326,
              "projectedCutoffMarks": 188,
              "confidence": "low",
              "basisYears": [
                2023
              ],
              "trend": "stable"
            }
          },
          "EWS": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 308,
                "openingRank": 160,
                "cutoffMarks": 189
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 366,
                "openingRank": 196,
                "cutoffMarks": 180
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 281,
                "openingRank": 88,
                "cutoffMarks": 195
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 387,
                "openingRank": 192,
                "cutoffMarks": 183
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 383,
                "openingRank": 104,
                "cutoffMarks": 184
              }
            ],
            "projection2026": {
              "projectedClosingRank": 396,
              "projectedCutoffMarks": 186,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "stable"
            }
          },
          "OBC/MOBC": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 269,
                "openingRank": 84,
                "cutoffMarks": 194
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 292,
                "openingRank": 108,
                "cutoffMarks": 192
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 316,
                "openingRank": 126,
                "cutoffMarks": 194
              }
            ],
            "projection2026": {
              "projectedClosingRank": 339,
              "projectedCutoffMarks": 193,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "SC": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 557,
                "openingRank": 192,
                "cutoffMarks": 166
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 610,
                "openingRank": 155,
                "cutoffMarks": 161
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 772,
                "openingRank": 267,
                "cutoffMarks": 148
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 607,
                "openingRank": 286,
                "cutoffMarks": 165
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 718,
                "openingRank": 318,
                "cutoffMarks": 153
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 846,
                "openingRank": 496,
                "cutoffMarks": 145
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 536,
                "openingRank": 299,
                "cutoffMarks": 162
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 767,
                "openingRank": 495,
                "cutoffMarks": 154
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 868,
                "openingRank": 520,
                "cutoffMarks": 146
              }
            ],
            "projection2026": {
              "projectedClosingRank": 925,
              "projectedCutoffMarks": 144,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "ST(P)": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 933,
                "openingRank": 508,
                "cutoffMarks": 137
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 967,
                "openingRank": 406,
                "cutoffMarks": 140
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 1148,
                "openingRank": 475,
                "cutoffMarks": 131
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 1075,
                "openingRank": 408,
                "cutoffMarks": 136
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1171,
              "projectedCutoffMarks": 132,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "ST(H)": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 992,
                "openingRank": 473,
                "cutoffMarks": 140
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 1353,
                "openingRank": 379,
                "cutoffMarks": 127
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 1068,
                "openingRank": 411,
                "cutoffMarks": 131
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 1623,
                "openingRank": 553,
                "cutoffMarks": 112
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 1578,
                "openingRank": 781,
                "cutoffMarks": 115
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1743,
              "projectedCutoffMarks": 106,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          }
        }
      },
      {
        "branchName": "Civil Engineering",
        "categories": {
          "General": {
            "history": [
              {
                "year": 2023,
                "round": 3,
                "closingRank": 464,
                "openingRank": 260,
                "cutoffMarks": 170
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 323,
                "openingRank": 185,
                "cutoffMarks": 186
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 405,
                "openingRank": 249,
                "cutoffMarks": 180
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 330,
                "openingRank": 197,
                "cutoffMarks": 187
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 375,
                "openingRank": 200,
                "cutoffMarks": 181
              }
            ],
            "projection2026": {
              "projectedClosingRank": 326,
              "projectedCutoffMarks": 188,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "tightening"
            }
          },
          "EWS": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 426,
                "openingRank": 233,
                "cutoffMarks": 178
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 489,
                "openingRank": 206,
                "cutoffMarks": 171
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 374,
                "openingRank": 234,
                "cutoffMarks": 186
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 553,
                "openingRank": 217,
                "cutoffMarks": 162
              }
            ],
            "projection2026": {
              "projectedClosingRank": 536,
              "projectedCutoffMarks": 164,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "OBC/MOBC": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 446,
                "openingRank": 263,
                "cutoffMarks": 174
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 559,
                "openingRank": 274,
                "cutoffMarks": 167
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 561,
                "openingRank": 297,
                "cutoffMarks": 166
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 460,
                "openingRank": 181,
                "cutoffMarks": 167
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 705,
                "openingRank": 371,
                "cutoffMarks": 153
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 422,
                "openingRank": 222,
                "cutoffMarks": 175
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 605,
                "openingRank": 211,
                "cutoffMarks": 161
              }
            ],
            "projection2026": {
              "projectedClosingRank": 668,
              "projectedCutoffMarks": 155,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "SC": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 843,
                "openingRank": 324,
                "cutoffMarks": 149
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 816,
                "openingRank": 479,
                "cutoffMarks": 149
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 1028,
                "openingRank": 556,
                "cutoffMarks": 137
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 1149,
                "openingRank": 540,
                "cutoffMarks": 130
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 880,
                "openingRank": 226,
                "cutoffMarks": 142
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 924,
                "openingRank": 379,
                "cutoffMarks": 136
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1053,
              "projectedCutoffMarks": 125,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "ST(P)": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 1014,
                "openingRank": 535,
                "cutoffMarks": 135
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 1350,
                "openingRank": 822,
                "cutoffMarks": 124
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 1516,
                "openingRank": 534,
                "cutoffMarks": 113
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1848,
              "projectedCutoffMarks": 91,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024
              ],
              "trend": "loosening"
            }
          },
          "ST(H)": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 1620,
                "openingRank": 802,
                "cutoffMarks": 111
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 2126,
                "openingRank": 1378,
                "cutoffMarks": 107
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 1371,
                "openingRank": 753,
                "cutoffMarks": 121
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 1896,
                "openingRank": 1188,
                "cutoffMarks": 104
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1568,
              "projectedCutoffMarks": 108,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "tightening"
            }
          }
        }
      },
      {
        "branchName": "Mechanical Engineering",
        "categories": {
          "General": {
            "history": [
              {
                "year": 2024,
                "round": 1,
                "closingRank": 313,
                "openingRank": 170,
                "cutoffMarks": 192
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 355,
                "openingRank": 177,
                "cutoffMarks": 183
              }
            ],
            "projection2026": {
              "projectedClosingRank": 397,
              "projectedCutoffMarks": 174,
              "confidence": "medium",
              "basisYears": [
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "EWS": {
            "history": [
              {
                "year": 2024,
                "round": 2,
                "closingRank": 451,
                "openingRank": 136,
                "cutoffMarks": 173
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 524,
                "openingRank": 151,
                "cutoffMarks": 169
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 381,
                "openingRank": 226,
                "cutoffMarks": 182
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 544,
                "openingRank": 269,
                "cutoffMarks": 164
              }
            ],
            "projection2026": {
              "projectedClosingRank": 564,
              "projectedCutoffMarks": 159,
              "confidence": "medium",
              "basisYears": [
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "OBC/MOBC": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 417,
                "openingRank": 169,
                "cutoffMarks": 174
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 453,
                "openingRank": 117,
                "cutoffMarks": 175
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 605,
                "openingRank": 217,
                "cutoffMarks": 164
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 365,
                "openingRank": 128,
                "cutoffMarks": 184
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 564,
                "openingRank": 214,
                "cutoffMarks": 162
              }
            ],
            "projection2026": {
              "projectedClosingRank": 470,
              "projectedCutoffMarks": 168,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "tightening"
            }
          },
          "SC": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 690,
                "openingRank": 308,
                "cutoffMarks": 159
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 871,
                "openingRank": 350,
                "cutoffMarks": 142
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 984,
                "openingRank": 352,
                "cutoffMarks": 141
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 707,
                "openingRank": 273,
                "cutoffMarks": 154
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 789,
                "openingRank": 257,
                "cutoffMarks": 149
              }
            ],
            "projection2026": {
              "projectedClosingRank": 632,
              "projectedCutoffMarks": 156,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "tightening"
            }
          },
          "ST(P)": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 817,
                "openingRank": 440,
                "cutoffMarks": 144
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 1004,
                "openingRank": 429,
                "cutoffMarks": 131
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 1511,
                "openingRank": 539,
                "cutoffMarks": 117
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 1358,
                "openingRank": 841,
                "cutoffMarks": 124
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1770,
              "projectedCutoffMarks": 108,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "ST(H)": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 1574,
                "openingRank": 727,
                "cutoffMarks": 120
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 1398,
                "openingRank": 667,
                "cutoffMarks": 123
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 1481,
                "openingRank": 848,
                "cutoffMarks": 121
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 2019,
                "openingRank": 529,
                "cutoffMarks": 106
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 1329,
                "openingRank": 507,
                "cutoffMarks": 124
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 2114,
                "openingRank": 1287,
                "cutoffMarks": 110
              }
            ],
            "projection2026": {
              "projectedClosingRank": 2442,
              "projectedCutoffMarks": 102,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          }
        }
      },
      {
        "branchName": "Instrumentation Engineering",
        "categories": {
          "General": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 288,
                "openingRank": 131,
                "cutoffMarks": 194
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 496,
                "openingRank": 291,
                "cutoffMarks": 171
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 411,
                "openingRank": 175,
                "cutoffMarks": 179
              }
            ],
            "projection2026": {
              "projectedClosingRank": 368,
              "projectedCutoffMarks": 183,
              "confidence": "medium",
              "basisYears": [
                2023,
                2025
              ],
              "trend": "tightening"
            }
          },
          "EWS": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 347,
                "openingRank": 127,
                "cutoffMarks": 187
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 564,
                "openingRank": 214,
                "cutoffMarks": 171
              }
            ],
            "projection2026": {
              "projectedClosingRank": 672,
              "projectedCutoffMarks": 163,
              "confidence": "medium",
              "basisYears": [
                2023,
                2025
              ],
              "trend": "loosening"
            }
          },
          "SC": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 1021,
                "openingRank": 443,
                "cutoffMarks": 138
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 1249,
                "openingRank": 810,
                "cutoffMarks": 130
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 1071,
                "openingRank": 387,
                "cutoffMarks": 135
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 1240,
                "openingRank": 603,
                "cutoffMarks": 127
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1236,
              "projectedCutoffMarks": 126,
              "confidence": "medium",
              "basisYears": [
                2023,
                2025
              ],
              "trend": "stable"
            }
          },
          "ST(P)": {
            "history": [
              {
                "year": 2023,
                "round": 3,
                "closingRank": 1415,
                "openingRank": 376,
                "cutoffMarks": 120
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 1146,
                "openingRank": 482,
                "cutoffMarks": 135
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 1302,
                "openingRank": 641,
                "cutoffMarks": 128
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 1204,
                "openingRank": 395,
                "cutoffMarks": 133
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 1308,
                "openingRank": 784,
                "cutoffMarks": 125
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 1591,
                "openingRank": 433,
                "cutoffMarks": 119
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1612,
              "projectedCutoffMarks": 121,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "ST(H)": {
            "history": [
              {
                "year": 2024,
                "round": 3,
                "closingRank": 2415,
                "openingRank": 1308,
                "cutoffMarks": 103
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 1822,
                "openingRank": 1019,
                "cutoffMarks": 108
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1229,
              "projectedCutoffMarks": 113,
              "confidence": "medium",
              "basisYears": [
                2024,
                2025
              ],
              "trend": "tightening"
            }
          }
        }
      }
    ]
  },
  {
    "id": "JIST",
    "name": "Jorhat Institute of Science and Technology",
    "shortName": "JIST",
    "city": "Jorhat",
    "branches": [
      {
        "branchName": "Electronics and Telecommunication Engineering",
        "categories": {
          "General": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 258,
                "openingRank": 113,
                "cutoffMarks": 197
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 329,
                "openingRank": 145,
                "cutoffMarks": 186
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 343,
                "openingRank": 101,
                "cutoffMarks": 186
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 436,
                "openingRank": 194,
                "cutoffMarks": 171
              }
            ],
            "projection2026": {
              "projectedClosingRank": 476,
              "projectedCutoffMarks": 166,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "EWS": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 306,
                "openingRank": 82,
                "cutoffMarks": 195
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 377,
                "openingRank": 185,
                "cutoffMarks": 184
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 427,
                "openingRank": 264,
                "cutoffMarks": 181
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 422,
                "openingRank": 234,
                "cutoffMarks": 177
              }
            ],
            "projection2026": {
              "projectedClosingRank": 412,
              "projectedCutoffMarks": 169,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024
              ],
              "trend": "stable"
            }
          },
          "OBC/MOBC": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 355,
                "openingRank": 176,
                "cutoffMarks": 180
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 392,
                "openingRank": 250,
                "cutoffMarks": 176
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 520,
                "openingRank": 194,
                "cutoffMarks": 164
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 553,
                "openingRank": 194,
                "cutoffMarks": 164
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 455,
                "openingRank": 123,
                "cutoffMarks": 173
              }
            ],
            "projection2026": {
              "projectedClosingRank": 554,
              "projectedCutoffMarks": 165,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "SC": {
            "history": [
              {
                "year": 2024,
                "round": 1,
                "closingRank": 641,
                "openingRank": 331,
                "cutoffMarks": 162
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 803,
                "openingRank": 320,
                "cutoffMarks": 146
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 1069,
                "openingRank": 431,
                "cutoffMarks": 137
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 674,
                "openingRank": 202,
                "cutoffMarks": 157
              }
            ],
            "projection2026": {
              "projectedClosingRank": 279,
              "projectedCutoffMarks": 177,
              "confidence": "medium",
              "basisYears": [
                2024,
                2025
              ],
              "trend": "tightening"
            }
          },
          "ST(P)": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 1036,
                "openingRank": 290,
                "cutoffMarks": 136
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 854,
                "openingRank": 469,
                "cutoffMarks": 150
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 1143,
                "openingRank": 720,
                "cutoffMarks": 129
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1196,
              "projectedCutoffMarks": 126,
              "confidence": "medium",
              "basisYears": [
                2023,
                2025
              ],
              "trend": "loosening"
            }
          },
          "ST(H)": {
            "history": [
              {
                "year": 2023,
                "round": 3,
                "closingRank": 1882,
                "openingRank": 1135,
                "cutoffMarks": 108
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 1573,
                "openingRank": 989,
                "cutoffMarks": 125
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1418,
              "projectedCutoffMarks": 134,
              "confidence": "medium",
              "basisYears": [
                2023,
                2025
              ],
              "trend": "tightening"
            }
          }
        }
      },
      {
        "branchName": "Civil Engineering",
        "categories": {
          "General": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 447,
                "openingRank": 273,
                "cutoffMarks": 178
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 703,
                "openingRank": 259,
                "cutoffMarks": 152
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 571,
                "openingRank": 248,
                "cutoffMarks": 164
              }
            ],
            "projection2026": {
              "projectedClosingRank": 505,
              "projectedCutoffMarks": 170,
              "confidence": "medium",
              "basisYears": [
                2023,
                2025
              ],
              "trend": "tightening"
            }
          },
          "EWS": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 546,
                "openingRank": 138,
                "cutoffMarks": 166
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 735,
                "openingRank": 230,
                "cutoffMarks": 149
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 686,
                "openingRank": 207,
                "cutoffMarks": 158
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 799,
                "openingRank": 378,
                "cutoffMarks": 149
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 604,
                "openingRank": 245,
                "cutoffMarks": 162
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 736,
                "openingRank": 398,
                "cutoffMarks": 153
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 1003,
                "openingRank": 284,
                "cutoffMarks": 142
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1114,
              "projectedCutoffMarks": 140,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "OBC/MOBC": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 655,
                "openingRank": 398,
                "cutoffMarks": 157
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 839,
                "openingRank": 454,
                "cutoffMarks": 151
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 740,
                "openingRank": 367,
                "cutoffMarks": 152
              }
            ],
            "projection2026": {
              "projectedClosingRank": 690,
              "projectedCutoffMarks": 152,
              "confidence": "medium",
              "basisYears": [
                2023,
                2025
              ],
              "trend": "tightening"
            }
          },
          "SC": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 1324,
                "openingRank": 634,
                "cutoffMarks": 125
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 1300,
                "openingRank": 497,
                "cutoffMarks": 122
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 1361,
                "openingRank": 758,
                "cutoffMarks": 125
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1365,
              "projectedCutoffMarks": 124,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "stable"
            }
          },
          "ST(P)": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 1596,
                "openingRank": 685,
                "cutoffMarks": 114
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 2121,
                "openingRank": 588,
                "cutoffMarks": 104
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 2502,
                "openingRank": 780,
                "cutoffMarks": 97
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 1581,
                "openingRank": 462,
                "cutoffMarks": 115
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 1900,
                "openingRank": 1127,
                "cutoffMarks": 106
              }
            ],
            "projection2026": {
              "projectedClosingRank": 696,
              "projectedCutoffMarks": 124,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024
              ],
              "trend": "tightening"
            }
          },
          "ST(H)": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 2603,
                "openingRank": 907,
                "cutoffMarks": 95
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 2431,
                "openingRank": 1547,
                "cutoffMarks": 98
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 2917,
                "openingRank": 1344,
                "cutoffMarks": 92
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 3184,
                "openingRank": 1939,
                "cutoffMarks": 87
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 3291,
                "openingRank": 1415,
                "cutoffMarks": 89
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 3324,
                "openingRank": 1146,
                "cutoffMarks": 86
              }
            ],
            "projection2026": {
              "projectedClosingRank": 3758,
              "projectedCutoffMarks": 80,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          }
        }
      },
      {
        "branchName": "Mechanical Engineering",
        "categories": {
          "General": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 605,
                "openingRank": 244,
                "cutoffMarks": 166
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 728,
                "openingRank": 455,
                "cutoffMarks": 152
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 524,
                "openingRank": 239,
                "cutoffMarks": 163
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 597,
                "openingRank": 362,
                "cutoffMarks": 159
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 475,
                "openingRank": 169,
                "cutoffMarks": 172
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 745,
                "openingRank": 293,
                "cutoffMarks": 154
              }
            ],
            "projection2026": {
              "projectedClosingRank": 707,
              "projectedCutoffMarks": 157,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "stable"
            }
          },
          "EWS": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 630,
                "openingRank": 164,
                "cutoffMarks": 159
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 503,
                "openingRank": 147,
                "cutoffMarks": 167
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 634,
                "openingRank": 398,
                "cutoffMarks": 158
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 789,
                "openingRank": 242,
                "cutoffMarks": 150
              }
            ],
            "projection2026": {
              "projectedClosingRank": 800,
              "projectedCutoffMarks": 150,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "OBC/MOBC": {
            "history": [
              {
                "year": 2023,
                "round": 3,
                "closingRank": 870,
                "openingRank": 290,
                "cutoffMarks": 142
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 972,
                "openingRank": 323,
                "cutoffMarks": 142
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 857,
                "openingRank": 540,
                "cutoffMarks": 144
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 1086,
                "openingRank": 619,
                "cutoffMarks": 126
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1192,
              "projectedCutoffMarks": 121,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "SC": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 1360,
                "openingRank": 851,
                "cutoffMarks": 119
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 1123,
                "openingRank": 507,
                "cutoffMarks": 135
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 1418,
                "openingRank": 591,
                "cutoffMarks": 121
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 1823,
                "openingRank": 503,
                "cutoffMarks": 114
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 1541,
                "openingRank": 387,
                "cutoffMarks": 118
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 1949,
                "openingRank": 1046,
                "cutoffMarks": 110
              }
            ],
            "projection2026": {
              "projectedClosingRank": 2300,
              "projectedCutoffMarks": 105,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "ST(P)": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 1405,
                "openingRank": 874,
                "cutoffMarks": 122
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 1727,
                "openingRank": 728,
                "cutoffMarks": 115
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 2383,
                "openingRank": 1319,
                "cutoffMarks": 99
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 1614,
                "openingRank": 443,
                "cutoffMarks": 114
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 1924,
                "openingRank": 940,
                "cutoffMarks": 108
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 2447,
                "openingRank": 667,
                "cutoffMarks": 97
              }
            ],
            "projection2026": {
              "projectedClosingRank": 2212,
              "projectedCutoffMarks": 101,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "stable"
            }
          },
          "ST(H)": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 2530,
                "openingRank": 1121,
                "cutoffMarks": 95
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 3337,
                "openingRank": 1174,
                "cutoffMarks": 86
              }
            ],
            "projection2026": {
              "projectedClosingRank": 4951,
              "projectedCutoffMarks": 68,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024
              ],
              "trend": "loosening"
            }
          }
        }
      },
      {
        "branchName": "Power Electronics and Instrumentation",
        "categories": {
          "General": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 781,
                "openingRank": 421,
                "cutoffMarks": 150
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 633,
                "openingRank": 385,
                "cutoffMarks": 156
              }
            ],
            "projection2026": {
              "projectedClosingRank": 337,
              "projectedCutoffMarks": 168,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024
              ],
              "trend": "tightening"
            }
          },
          "EWS": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 831,
                "openingRank": 368,
                "cutoffMarks": 148
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 765,
                "openingRank": 423,
                "cutoffMarks": 147
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 1063,
                "openingRank": 445,
                "cutoffMarks": 134
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 688,
                "openingRank": 176,
                "cutoffMarks": 154
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 1171,
                "openingRank": 377,
                "cutoffMarks": 132
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1362,
              "projectedCutoffMarks": 122,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "OBC/MOBC": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 856,
                "openingRank": 413,
                "cutoffMarks": 143
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 1335,
                "openingRank": 427,
                "cutoffMarks": 124
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 1135,
                "openingRank": 318,
                "cutoffMarks": 130
              }
            ],
            "projection2026": {
              "projectedClosingRank": 735,
              "projectedCutoffMarks": 142,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024
              ],
              "trend": "tightening"
            }
          },
          "SC": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 1377,
                "openingRank": 874,
                "cutoffMarks": 123
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 1808,
                "openingRank": 749,
                "cutoffMarks": 114
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 1694,
                "openingRank": 973,
                "cutoffMarks": 116
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 2159,
                "openingRank": 855,
                "cutoffMarks": 106
              }
            ],
            "projection2026": {
              "projectedClosingRank": 2334,
              "projectedCutoffMarks": 102,
              "confidence": "medium",
              "basisYears": [
                2023,
                2025
              ],
              "trend": "loosening"
            }
          },
          "ST(P)": {
            "history": [
              {
                "year": 2023,
                "round": 3,
                "closingRank": 2727,
                "openingRank": 1403,
                "cutoffMarks": 94
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 1959,
                "openingRank": 666,
                "cutoffMarks": 107
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 3175,
                "openingRank": 1212,
                "cutoffMarks": 90
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 2222,
                "openingRank": 1436,
                "cutoffMarks": 106
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 2384,
                "openingRank": 1238,
                "cutoffMarks": 99
              }
            ],
            "projection2026": {
              "projectedClosingRank": 2419,
              "projectedCutoffMarks": 99,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "tightening"
            }
          },
          "ST(H)": {
            "history": [
              {
                "year": 2023,
                "round": 3,
                "closingRank": 3688,
                "openingRank": 1333,
                "cutoffMarks": 77
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 2673,
                "openingRank": 1169,
                "cutoffMarks": 95
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 3762,
                "openingRank": 1459,
                "cutoffMarks": 78
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 4106,
                "openingRank": 1055,
                "cutoffMarks": 76
              }
            ],
            "projection2026": {
              "projectedClosingRank": 4942,
              "projectedCutoffMarks": 74,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024
              ],
              "trend": "loosening"
            }
          }
        }
      }
    ]
  },
  {
    "id": "BBEC",
    "name": "Bineswar Brahma Engineering College",
    "shortName": "BBEC",
    "city": "Kokrajhar",
    "branches": [
      {
        "branchName": "Electrical Engineering",
        "categories": {
          "General": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 459,
                "openingRank": 184,
                "cutoffMarks": 172
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 672,
                "openingRank": 293,
                "cutoffMarks": 154
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 488,
                "openingRank": 304,
                "cutoffMarks": 170
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 571,
                "openingRank": 191,
                "cutoffMarks": 160
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 731,
                "openingRank": 358,
                "cutoffMarks": 156
              }
            ],
            "projection2026": {
              "projectedClosingRank": 760,
              "projectedCutoffMarks": 157,
              "confidence": "medium",
              "basisYears": [
                2023,
                2025
              ],
              "trend": "loosening"
            }
          },
          "EWS": {
            "history": [
              {
                "year": 2024,
                "round": 1,
                "closingRank": 528,
                "openingRank": 291,
                "cutoffMarks": 171
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 716,
                "openingRank": 429,
                "cutoffMarks": 154
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 540,
                "openingRank": 198,
                "cutoffMarks": 164
              }
            ],
            "projection2026": {
              "projectedClosingRank": 364,
              "projectedCutoffMarks": 174,
              "confidence": "medium",
              "basisYears": [
                2024,
                2025
              ],
              "trend": "tightening"
            }
          },
          "OBC/MOBC": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 621,
                "openingRank": 223,
                "cutoffMarks": 163
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 740,
                "openingRank": 449,
                "cutoffMarks": 150
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 945,
                "openingRank": 398,
                "cutoffMarks": 142
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 834,
                "openingRank": 313,
                "cutoffMarks": 140
              }
            ],
            "projection2026": {
              "projectedClosingRank": 612,
              "projectedCutoffMarks": 136,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024
              ],
              "trend": "tightening"
            }
          },
          "SC": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 1293,
                "openingRank": 779,
                "cutoffMarks": 124
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 2050,
                "openingRank": 1025,
                "cutoffMarks": 102
              }
            ],
            "projection2026": {
              "projectedClosingRank": 2428,
              "projectedCutoffMarks": 91,
              "confidence": "medium",
              "basisYears": [
                2023,
                2025
              ],
              "trend": "loosening"
            }
          },
          "ST(P)": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 1915,
                "openingRank": 865,
                "cutoffMarks": 109
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 1442,
                "openingRank": 394,
                "cutoffMarks": 121
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 1867,
                "openingRank": 703,
                "cutoffMarks": 105
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 1872,
                "openingRank": 769,
                "cutoffMarks": 107
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1842,
              "projectedCutoffMarks": 105,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "stable"
            }
          },
          "ST(H)": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 2785,
                "openingRank": 1440,
                "cutoffMarks": 94
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 3428,
                "openingRank": 924,
                "cutoffMarks": 82
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 2968,
                "openingRank": 1314,
                "cutoffMarks": 84
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 3374,
                "openingRank": 1790,
                "cutoffMarks": 82
              }
            ],
            "projection2026": {
              "projectedClosingRank": 3785,
              "projectedCutoffMarks": 74,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          }
        }
      },
      {
        "branchName": "Civil Engineering",
        "categories": {
          "General": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 570,
                "openingRank": 145,
                "cutoffMarks": 166
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 765,
                "openingRank": 442,
                "cutoffMarks": 144
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 973,
                "openingRank": 335,
                "cutoffMarks": 141
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 870,
                "openingRank": 464,
                "cutoffMarks": 152
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 653,
                "openingRank": 390,
                "cutoffMarks": 162
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 915,
                "openingRank": 368,
                "cutoffMarks": 144
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 1122,
                "openingRank": 358,
                "cutoffMarks": 133
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1137,
              "projectedCutoffMarks": 134,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "EWS": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 765,
                "openingRank": 297,
                "cutoffMarks": 155
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 855,
                "openingRank": 273,
                "cutoffMarks": 148
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 969,
                "openingRank": 249,
                "cutoffMarks": 140
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 740,
                "openingRank": 325,
                "cutoffMarks": 153
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 880,
                "openingRank": 505,
                "cutoffMarks": 142
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 1047,
                "openingRank": 356,
                "cutoffMarks": 131
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 1024,
                "openingRank": 606,
                "cutoffMarks": 142
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 1199,
                "openingRank": 550,
                "cutoffMarks": 132
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1302,
              "projectedCutoffMarks": 126,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "OBC/MOBC": {
            "history": [
              {
                "year": 2024,
                "round": 1,
                "closingRank": 963,
                "openingRank": 573,
                "cutoffMarks": 145
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 1167,
                "openingRank": 357,
                "cutoffMarks": 135
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1371,
              "projectedCutoffMarks": 125,
              "confidence": "medium",
              "basisYears": [
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "SC": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 1770,
                "openingRank": 612,
                "cutoffMarks": 114
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 1688,
                "openingRank": 478,
                "cutoffMarks": 115
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 2102,
                "openingRank": 866,
                "cutoffMarks": 103
              }
            ],
            "projection2026": {
              "projectedClosingRank": 2766,
              "projectedCutoffMarks": 81,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024
              ],
              "trend": "loosening"
            }
          },
          "ST(P)": {
            "history": [
              {
                "year": 2023,
                "round": 3,
                "closingRank": 2863,
                "openingRank": 750,
                "cutoffMarks": 91
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 2230,
                "openingRank": 986,
                "cutoffMarks": 103
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 2823,
                "openingRank": 806,
                "cutoffMarks": 94
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 3220,
                "openingRank": 1903,
                "cutoffMarks": 86
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 2766,
                "openingRank": 1454,
                "cutoffMarks": 96
              }
            ],
            "projection2026": {
              "projectedClosingRank": 2853,
              "projectedCutoffMarks": 96,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "stable"
            }
          },
          "ST(H)": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 2747,
                "openingRank": 1763,
                "cutoffMarks": 93
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 4515,
                "openingRank": 1608,
                "cutoffMarks": 71
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 2875,
                "openingRank": 1728,
                "cutoffMarks": 89
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 3950,
                "openingRank": 1234,
                "cutoffMarks": 77
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 4160,
                "openingRank": 1882,
                "cutoffMarks": 73
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 4252,
                "openingRank": 1101,
                "cutoffMarks": 71
              }
            ],
            "projection2026": {
              "projectedClosingRank": 3976,
              "projectedCutoffMarks": 73,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "tightening"
            }
          }
        }
      },
      {
        "branchName": "Mechanical Engineering",
        "categories": {
          "General": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 543,
                "openingRank": 281,
                "cutoffMarks": 161
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 737,
                "openingRank": 233,
                "cutoffMarks": 151
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 594,
                "openingRank": 162,
                "cutoffMarks": 164
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 973,
                "openingRank": 456,
                "cutoffMarks": 138
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 905,
                "openingRank": 227,
                "cutoffMarks": 143
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1040,
              "projectedCutoffMarks": 136,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "EWS": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 835,
                "openingRank": 384,
                "cutoffMarks": 148
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 1033,
                "openingRank": 405,
                "cutoffMarks": 135
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1132,
              "projectedCutoffMarks": 128,
              "confidence": "medium",
              "basisYears": [
                2023,
                2025
              ],
              "trend": "loosening"
            }
          },
          "OBC/MOBC": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 742,
                "openingRank": 384,
                "cutoffMarks": 155
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 937,
                "openingRank": 238,
                "cutoffMarks": 144
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 1288,
                "openingRank": 404,
                "cutoffMarks": 132
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 1047,
                "openingRank": 596,
                "cutoffMarks": 132
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 968,
                "openingRank": 393,
                "cutoffMarks": 136
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 1392,
                "openingRank": 571,
                "cutoffMarks": 123
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1346,
              "projectedCutoffMarks": 120,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "SC": {
            "history": [
              {
                "year": 2025,
                "round": 1,
                "closingRank": 1467,
                "openingRank": 722,
                "cutoffMarks": 120
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 2065,
                "openingRank": 797,
                "cutoffMarks": 105
              }
            ],
            "projection2026": {
              "projectedClosingRank": 2065,
              "projectedCutoffMarks": 105,
              "confidence": "low",
              "basisYears": [
                2025
              ],
              "trend": "stable"
            }
          },
          "ST(P)": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 1977,
                "openingRank": 813,
                "cutoffMarks": 110
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 2015,
                "openingRank": 1036,
                "cutoffMarks": 107
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 2189,
                "openingRank": 1243,
                "cutoffMarks": 100
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 2023,
                "openingRank": 1265,
                "cutoffMarks": 106
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 2575,
                "openingRank": 1509,
                "cutoffMarks": 92
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 2880,
                "openingRank": 1611,
                "cutoffMarks": 94
              }
            ],
            "projection2026": {
              "projectedClosingRank": 3252,
              "projectedCutoffMarks": 85,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "ST(H)": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 3367,
                "openingRank": 1265,
                "cutoffMarks": 88
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 4072,
                "openingRank": 1222,
                "cutoffMarks": 79
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 2602,
                "openingRank": 1102,
                "cutoffMarks": 94
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1867,
              "projectedCutoffMarks": 102,
              "confidence": "medium",
              "basisYears": [
                2023,
                2025
              ],
              "trend": "tightening"
            }
          }
        }
      },
      {
        "branchName": "Chemical Engineering",
        "categories": {
          "General": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 862,
                "openingRank": 288,
                "cutoffMarks": 146
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 824,
                "openingRank": 319,
                "cutoffMarks": 147
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 1024,
                "openingRank": 354,
                "cutoffMarks": 130
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1348,
              "projectedCutoffMarks": 98,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024
              ],
              "trend": "loosening"
            }
          },
          "EWS": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 1091,
                "openingRank": 562,
                "cutoffMarks": 136
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 1106,
                "openingRank": 700,
                "cutoffMarks": 131
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 1001,
                "openingRank": 274,
                "cutoffMarks": 134
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 1217,
                "openingRank": 432,
                "cutoffMarks": 129
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 1386,
                "openingRank": 675,
                "cutoffMarks": 121
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1489,
              "projectedCutoffMarks": 114,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "OBC/MOBC": {
            "history": [
              {
                "year": 2024,
                "round": 1,
                "closingRank": 993,
                "openingRank": 602,
                "cutoffMarks": 139
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 1298,
                "openingRank": 417,
                "cutoffMarks": 128
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 1499,
                "openingRank": 633,
                "cutoffMarks": 119
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 1814,
                "openingRank": 555,
                "cutoffMarks": 111
              }
            ],
            "projection2026": {
              "projectedClosingRank": 2330,
              "projectedCutoffMarks": 94,
              "confidence": "medium",
              "basisYears": [
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "SC": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 1929,
                "openingRank": 1192,
                "cutoffMarks": 109
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 2556,
                "openingRank": 1120,
                "cutoffMarks": 87
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 1812,
                "openingRank": 586,
                "cutoffMarks": 110
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 2425,
                "openingRank": 936,
                "cutoffMarks": 99
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 1989,
                "openingRank": 1157,
                "cutoffMarks": 107
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1756,
              "projectedCutoffMarks": 118,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "tightening"
            }
          },
          "ST(P)": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 2096,
                "openingRank": 756,
                "cutoffMarks": 107
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 3248,
                "openingRank": 1376,
                "cutoffMarks": 84
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 3691,
                "openingRank": 1297,
                "cutoffMarks": 79
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 2783,
                "openingRank": 1401,
                "cutoffMarks": 96
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 3750,
                "openingRank": 1220,
                "cutoffMarks": 84
              }
            ],
            "projection2026": {
              "projectedClosingRank": 4833,
              "projectedCutoffMarks": 67,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "ST(H)": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 4077,
                "openingRank": 1639,
                "cutoffMarks": 75
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 4725,
                "openingRank": 3044,
                "cutoffMarks": 66
              }
            ],
            "projection2026": {
              "projectedClosingRank": 6021,
              "projectedCutoffMarks": 48,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024
              ],
              "trend": "loosening"
            }
          }
        }
      }
    ]
  },
  {
    "id": "BVEC",
    "name": "Barak Valley Engineering College",
    "shortName": "BVEC",
    "city": "Karimganj",
    "branches": [
      {
        "branchName": "Computer Science and Engineering",
        "categories": {
          "General": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 219,
                "openingRank": 82,
                "cutoffMarks": 203
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 366,
                "openingRank": 133,
                "cutoffMarks": 177
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 251,
                "openingRank": 163,
                "cutoffMarks": 199
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 309,
                "openingRank": 129,
                "cutoffMarks": 188
              }
            ],
            "projection2026": {
              "projectedClosingRank": 195,
              "projectedCutoffMarks": 210,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024
              ],
              "trend": "tightening"
            }
          },
          "EWS": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 284,
                "openingRank": 148,
                "cutoffMarks": 194
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 291,
                "openingRank": 132,
                "cutoffMarks": 190
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 351,
                "openingRank": 95,
                "cutoffMarks": 187
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 459,
                "openingRank": 195,
                "cutoffMarks": 169
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 326,
                "openingRank": 180,
                "cutoffMarks": 189
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 379,
                "openingRank": 221,
                "cutoffMarks": 185
              }
            ],
            "projection2026": {
              "projectedClosingRank": 469,
              "projectedCutoffMarks": 174,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "SC": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 557,
                "openingRank": 258,
                "cutoffMarks": 169
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 857,
                "openingRank": 379,
                "cutoffMarks": 143
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 1013,
                "openingRank": 624,
                "cutoffMarks": 138
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1265,
              "projectedCutoffMarks": 119,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "ST(P)": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 791,
                "openingRank": 433,
                "cutoffMarks": 146
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 1019,
                "openingRank": 274,
                "cutoffMarks": 140
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 1345,
                "openingRank": 821,
                "cutoffMarks": 127
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 1329,
                "openingRank": 778,
                "cutoffMarks": 126
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1541,
              "projectedCutoffMarks": 117,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "ST(H)": {
            "history": [
              {
                "year": 2023,
                "round": 3,
                "closingRank": 1691,
                "openingRank": 1030,
                "cutoffMarks": 119
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 1136,
                "openingRank": 296,
                "cutoffMarks": 131
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 1429,
                "openingRank": 911,
                "cutoffMarks": 123
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 1886,
                "openingRank": 599,
                "cutoffMarks": 110
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1984,
              "projectedCutoffMarks": 106,
              "confidence": "medium",
              "basisYears": [
                2023,
                2025
              ],
              "trend": "loosening"
            }
          }
        }
      },
      {
        "branchName": "Electronics and Telecommunication Engineering",
        "categories": {
          "General": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 400,
                "openingRank": 191,
                "cutoffMarks": 175
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 445,
                "openingRank": 153,
                "cutoffMarks": 174
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 571,
                "openingRank": 217,
                "cutoffMarks": 163
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 435,
                "openingRank": 273,
                "cutoffMarks": 175
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 500,
                "openingRank": 307,
                "cutoffMarks": 165
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 607,
                "openingRank": 278,
                "cutoffMarks": 158
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 467,
                "openingRank": 118,
                "cutoffMarks": 170
              }
            ],
            "projection2026": {
              "projectedClosingRank": 444,
              "projectedCutoffMarks": 171,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "tightening"
            }
          },
          "EWS": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 569,
                "openingRank": 168,
                "cutoffMarks": 166
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 760,
                "openingRank": 404,
                "cutoffMarks": 151
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 627,
                "openingRank": 225,
                "cutoffMarks": 159
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 795,
                "openingRank": 313,
                "cutoffMarks": 149
              }
            ],
            "projection2026": {
              "projectedClosingRank": 934,
              "projectedCutoffMarks": 138,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "OBC/MOBC": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 500,
                "openingRank": 155,
                "cutoffMarks": 171
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 621,
                "openingRank": 361,
                "cutoffMarks": 163
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 829,
                "openingRank": 361,
                "cutoffMarks": 147
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 780,
                "openingRank": 210,
                "cutoffMarks": 155
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 654,
                "openingRank": 397,
                "cutoffMarks": 158
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 819,
                "openingRank": 250,
                "cutoffMarks": 147
              }
            ],
            "projection2026": {
              "projectedClosingRank": 799,
              "projectedCutoffMarks": 150,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "stable"
            }
          },
          "SC": {
            "history": [
              {
                "year": 2023,
                "round": 3,
                "closingRank": 1321,
                "openingRank": 678,
                "cutoffMarks": 128
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 1032,
                "openingRank": 425,
                "cutoffMarks": 131
              }
            ],
            "projection2026": {
              "projectedClosingRank": 454,
              "projectedCutoffMarks": 137,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024
              ],
              "trend": "tightening"
            }
          },
          "ST(P)": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 1560,
                "openingRank": 658,
                "cutoffMarks": 116
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 1878,
                "openingRank": 547,
                "cutoffMarks": 111
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 1226,
                "openingRank": 785,
                "cutoffMarks": 129
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 1774,
                "openingRank": 619,
                "cutoffMarks": 115
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 1399,
                "openingRank": 405,
                "cutoffMarks": 124
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 1876,
                "openingRank": 1152,
                "cutoffMarks": 112
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1841,
              "projectedCutoffMarks": 114,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "stable"
            }
          },
          "ST(H)": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 1613,
                "openingRank": 659,
                "cutoffMarks": 117
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 2306,
                "openingRank": 1131,
                "cutoffMarks": 95
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 2517,
                "openingRank": 1573,
                "cutoffMarks": 93
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 1884,
                "openingRank": 642,
                "cutoffMarks": 113
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 2274,
                "openingRank": 685,
                "cutoffMarks": 101
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 2543,
                "openingRank": 1158,
                "cutoffMarks": 99
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 2342,
                "openingRank": 942,
                "cutoffMarks": 101
              }
            ],
            "projection2026": {
              "projectedClosingRank": 2292,
              "projectedCutoffMarks": 106,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "tightening"
            }
          }
        }
      },
      {
        "branchName": "Civil Engineering",
        "categories": {
          "General": {
            "history": [
              {
                "year": 2023,
                "round": 3,
                "closingRank": 1088,
                "openingRank": 449,
                "cutoffMarks": 136
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 918,
                "openingRank": 310,
                "cutoffMarks": 145
              }
            ],
            "projection2026": {
              "projectedClosingRank": 833,
              "projectedCutoffMarks": 150,
              "confidence": "medium",
              "basisYears": [
                2023,
                2025
              ],
              "trend": "tightening"
            }
          },
          "EWS": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 765,
                "openingRank": 418,
                "cutoffMarks": 154
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 1311,
                "openingRank": 363,
                "cutoffMarks": 123
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 1166,
                "openingRank": 309,
                "cutoffMarks": 132
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 1230,
                "openingRank": 744,
                "cutoffMarks": 132
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 907,
                "openingRank": 534,
                "cutoffMarks": 141
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 1086,
                "openingRank": 374,
                "cutoffMarks": 129
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 1473,
                "openingRank": 406,
                "cutoffMarks": 117
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1500,
              "projectedCutoffMarks": 118,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "OBC/MOBC": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 1110,
                "openingRank": 357,
                "cutoffMarks": 132
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 1170,
                "openingRank": 581,
                "cutoffMarks": 133
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 1177,
                "openingRank": 503,
                "cutoffMarks": 130
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1191,
              "projectedCutoffMarks": 124,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024
              ],
              "trend": "stable"
            }
          },
          "SC": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 1691,
                "openingRank": 960,
                "cutoffMarks": 116
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 2014,
                "openingRank": 545,
                "cutoffMarks": 110
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 2935,
                "openingRank": 1525,
                "cutoffMarks": 90
              }
            ],
            "projection2026": {
              "projectedClosingRank": 5423,
              "projectedCutoffMarks": 38,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024
              ],
              "trend": "loosening"
            }
          },
          "ST(P)": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 2193,
                "openingRank": 691,
                "cutoffMarks": 104
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 3203,
                "openingRank": 969,
                "cutoffMarks": 84
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 3612,
                "openingRank": 1013,
                "cutoffMarks": 83
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 3918,
                "openingRank": 2012,
                "cutoffMarks": 78
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 2457,
                "openingRank": 779,
                "cutoffMarks": 98
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 2954,
                "openingRank": 1600,
                "cutoffMarks": 93
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 4182,
                "openingRank": 1722,
                "cutoffMarks": 71
              }
            ],
            "projection2026": {
              "projectedClosingRank": 4474,
              "projectedCutoffMarks": 65,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "ST(H)": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 3388,
                "openingRank": 1555,
                "cutoffMarks": 82
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 3995,
                "openingRank": 1538,
                "cutoffMarks": 77
              }
            ],
            "projection2026": {
              "projectedClosingRank": 4298,
              "projectedCutoffMarks": 74,
              "confidence": "medium",
              "basisYears": [
                2023,
                2025
              ],
              "trend": "loosening"
            }
          }
        }
      },
      {
        "branchName": "Mechanical Engineering",
        "categories": {
          "General": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 651,
                "openingRank": 314,
                "cutoffMarks": 157
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 808,
                "openingRank": 318,
                "cutoffMarks": 146
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 1083,
                "openingRank": 412,
                "cutoffMarks": 130
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 678,
                "openingRank": 306,
                "cutoffMarks": 156
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 955,
                "openingRank": 376,
                "cutoffMarks": 146
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 1166,
                "openingRank": 425,
                "cutoffMarks": 133
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 1018,
                "openingRank": 502,
                "cutoffMarks": 133
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1024,
              "projectedCutoffMarks": 135,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "tightening"
            }
          },
          "EWS": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 756,
                "openingRank": 229,
                "cutoffMarks": 154
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 837,
                "openingRank": 498,
                "cutoffMarks": 147
              }
            ],
            "projection2026": {
              "projectedClosingRank": 999,
              "projectedCutoffMarks": 133,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024
              ],
              "trend": "loosening"
            }
          },
          "OBC/MOBC": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 958,
                "openingRank": 259,
                "cutoffMarks": 136
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 1104,
                "openingRank": 398,
                "cutoffMarks": 134
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 1526,
                "openingRank": 516,
                "cutoffMarks": 111
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 994,
                "openingRank": 632,
                "cutoffMarks": 145
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 1307,
                "openingRank": 826,
                "cutoffMarks": 128
              }
            ],
            "projection2026": {
              "projectedClosingRank": 869,
              "projectedCutoffMarks": 162,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024
              ],
              "trend": "tightening"
            }
          },
          "SC": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 2173,
                "openingRank": 787,
                "cutoffMarks": 103
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 2530,
                "openingRank": 939,
                "cutoffMarks": 100
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 1927,
                "openingRank": 931,
                "cutoffMarks": 106
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 1722,
                "openingRank": 1104,
                "cutoffMarks": 110
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 2397,
                "openingRank": 1397,
                "cutoffMarks": 103
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 2930,
                "openingRank": 1572,
                "cutoffMarks": 94
              }
            ],
            "projection2026": {
              "projectedClosingRank": 2862,
              "projectedCutoffMarks": 94,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "ST(P)": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 2290,
                "openingRank": 1118,
                "cutoffMarks": 94
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 3548,
                "openingRank": 1055,
                "cutoffMarks": 82
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 3210,
                "openingRank": 1350,
                "cutoffMarks": 85
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 3137,
                "openingRank": 810,
                "cutoffMarks": 84
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 3687,
                "openingRank": 2335,
                "cutoffMarks": 78
              }
            ],
            "projection2026": {
              "projectedClosingRank": 3621,
              "projectedCutoffMarks": 78,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "stable"
            }
          },
          "ST(H)": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 4058,
                "openingRank": 1943,
                "cutoffMarks": 73
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 4621,
                "openingRank": 1215,
                "cutoffMarks": 71
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 3796,
                "openingRank": 1862,
                "cutoffMarks": 85
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 4793,
                "openingRank": 2696,
                "cutoffMarks": 68
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 3083,
                "openingRank": 1525,
                "cutoffMarks": 94
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 4025,
                "openingRank": 2464,
                "cutoffMarks": 75
              }
            ],
            "projection2026": {
              "projectedClosingRank": 3884,
              "projectedCutoffMarks": 75,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "tightening"
            }
          }
        }
      }
    ]
  },
  {
    "id": "DEC",
    "name": "Dhemaji Engineering College",
    "shortName": "DEC",
    "city": "Dhemaji",
    "branches": [
      {
        "branchName": "Computer Science and Engineering",
        "categories": {
          "General": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 262,
                "openingRank": 161,
                "cutoffMarks": 192
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 277,
                "openingRank": 90,
                "cutoffMarks": 198
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 343,
                "openingRank": 190,
                "cutoffMarks": 183
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 470,
                "openingRank": 141,
                "cutoffMarks": 168
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 293,
                "openingRank": 101,
                "cutoffMarks": 188
              }
            ],
            "projection2026": {
              "projectedClosingRank": 373,
              "projectedCutoffMarks": 179,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "EWS": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 301,
                "openingRank": 164,
                "cutoffMarks": 192
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 345,
                "openingRank": 199,
                "cutoffMarks": 182
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 463,
                "openingRank": 149,
                "cutoffMarks": 171
              }
            ],
            "projection2026": {
              "projectedClosingRank": 787,
              "projectedCutoffMarks": 129,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024
              ],
              "trend": "loosening"
            }
          },
          "OBC/MOBC": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 394,
                "openingRank": 105,
                "cutoffMarks": 176
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 374,
                "openingRank": 100,
                "cutoffMarks": 183
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 591,
                "openingRank": 209,
                "cutoffMarks": 160
              }
            ],
            "projection2026": {
              "projectedClosingRank": 985,
              "projectedCutoffMarks": 128,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024
              ],
              "trend": "loosening"
            }
          },
          "SC": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 666,
                "openingRank": 270,
                "cutoffMarks": 154
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 1126,
                "openingRank": 301,
                "cutoffMarks": 130
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 755,
                "openingRank": 271,
                "cutoffMarks": 147
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 904,
                "openingRank": 513,
                "cutoffMarks": 138
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 892,
                "openingRank": 281,
                "cutoffMarks": 149
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 1063,
                "openingRank": 499,
                "cutoffMarks": 138
              }
            ],
            "projection2026": {
              "projectedClosingRank": 968,
              "projectedCutoffMarks": 143,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "stable"
            }
          },
          "ST(P)": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 1176,
                "openingRank": 686,
                "cutoffMarks": 129
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 858,
                "openingRank": 466,
                "cutoffMarks": 149
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 948,
                "openingRank": 395,
                "cutoffMarks": 143
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 1220,
                "openingRank": 395,
                "cutoffMarks": 128
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1129,
              "projectedCutoffMarks": 134,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "stable"
            }
          },
          "ST(H)": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 1280,
                "openingRank": 563,
                "cutoffMarks": 130
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 1831,
                "openingRank": 798,
                "cutoffMarks": 111
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 1549,
                "openingRank": 766,
                "cutoffMarks": 113
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 2068,
                "openingRank": 718,
                "cutoffMarks": 103
              }
            ],
            "projection2026": {
              "projectedClosingRank": 2053,
              "projectedCutoffMarks": 101,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          }
        }
      },
      {
        "branchName": "Civil Engineering",
        "categories": {
          "General": {
            "history": [
              {
                "year": 2023,
                "round": 3,
                "closingRank": 1273,
                "openingRank": 751,
                "cutoffMarks": 128
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 880,
                "openingRank": 552,
                "cutoffMarks": 140
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 1067,
                "openingRank": 307,
                "cutoffMarks": 137
              }
            ],
            "projection2026": {
              "projectedClosingRank": 655,
              "projectedCutoffMarks": 155,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024
              ],
              "trend": "tightening"
            }
          },
          "EWS": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 937,
                "openingRank": 505,
                "cutoffMarks": 141
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 1089,
                "openingRank": 494,
                "cutoffMarks": 133
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 939,
                "openingRank": 288,
                "cutoffMarks": 140
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 1389,
                "openingRank": 730,
                "cutoffMarks": 120
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 1600,
                "openingRank": 662,
                "cutoffMarks": 113
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1870,
              "projectedCutoffMarks": 102,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "OBC/MOBC": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 1079,
                "openingRank": 570,
                "cutoffMarks": 134
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 1577,
                "openingRank": 428,
                "cutoffMarks": 122
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 1434,
                "openingRank": 446,
                "cutoffMarks": 121
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 1788,
                "openingRank": 682,
                "cutoffMarks": 112
              }
            ],
            "projection2026": {
              "projectedClosingRank": 2190,
              "projectedCutoffMarks": 101,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "SC": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 2122,
                "openingRank": 1201,
                "cutoffMarks": 103
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 3143,
                "openingRank": 866,
                "cutoffMarks": 87
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 2477,
                "openingRank": 1397,
                "cutoffMarks": 99
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 3195,
                "openingRank": 1999,
                "cutoffMarks": 87
              }
            ],
            "projection2026": {
              "projectedClosingRank": 3893,
              "projectedCutoffMarks": 76,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "ST(P)": {
            "history": [
              {
                "year": 2024,
                "round": 1,
                "closingRank": 2635,
                "openingRank": 1336,
                "cutoffMarks": 93
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 3875,
                "openingRank": 2274,
                "cutoffMarks": 76
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 4331,
                "openingRank": 2160,
                "cutoffMarks": 77
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 4211,
                "openingRank": 1386,
                "cutoffMarks": 71
              }
            ],
            "projection2026": {
              "projectedClosingRank": 4091,
              "projectedCutoffMarks": 65,
              "confidence": "medium",
              "basisYears": [
                2024,
                2025
              ],
              "trend": "stable"
            }
          },
          "ST(H)": {
            "history": [
              {
                "year": 2025,
                "round": 3,
                "closingRank": 5709,
                "openingRank": 1765,
                "cutoffMarks": 50
              }
            ],
            "projection2026": {
              "projectedClosingRank": 5709,
              "projectedCutoffMarks": 50,
              "confidence": "low",
              "basisYears": [
                2025
              ],
              "trend": "stable"
            }
          }
        }
      },
      {
        "branchName": "Mechanical Engineering",
        "categories": {
          "General": {
            "history": [
              {
                "year": 2024,
                "round": 1,
                "closingRank": 872,
                "openingRank": 325,
                "cutoffMarks": 138
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 1083,
                "openingRank": 463,
                "cutoffMarks": 132
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 1217,
                "openingRank": 431,
                "cutoffMarks": 126
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 830,
                "openingRank": 493,
                "cutoffMarks": 146
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 1196,
                "openingRank": 469,
                "cutoffMarks": 134
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1175,
              "projectedCutoffMarks": 142,
              "confidence": "medium",
              "basisYears": [
                2024,
                2025
              ],
              "trend": "stable"
            }
          },
          "EWS": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 979,
                "openingRank": 258,
                "cutoffMarks": 136
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 1246,
                "openingRank": 725,
                "cutoffMarks": 129
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 1265,
                "openingRank": 356,
                "cutoffMarks": 126
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 1078,
                "openingRank": 654,
                "cutoffMarks": 135
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1028,
              "projectedCutoffMarks": 136,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "tightening"
            }
          },
          "OBC/MOBC": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 1399,
                "openingRank": 699,
                "cutoffMarks": 124
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 1274,
                "openingRank": 467,
                "cutoffMarks": 124
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 1501,
                "openingRank": 375,
                "cutoffMarks": 118
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 1819,
                "openingRank": 826,
                "cutoffMarks": 106
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 1495,
                "openingRank": 726,
                "cutoffMarks": 120
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 1799,
                "openingRank": 758,
                "cutoffMarks": 118
              }
            ],
            "projection2026": {
              "projectedClosingRank": 2072,
              "projectedCutoffMarks": 110,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "SC": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 2132,
                "openingRank": 1361,
                "cutoffMarks": 108
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 2615,
                "openingRank": 1494,
                "cutoffMarks": 92
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 2247,
                "openingRank": 800,
                "cutoffMarks": 103
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 2585,
                "openingRank": 1013,
                "cutoffMarks": 92
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 2247,
                "openingRank": 1051,
                "cutoffMarks": 105
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 2969,
                "openingRank": 1118,
                "cutoffMarks": 92
              }
            ],
            "projection2026": {
              "projectedClosingRank": 3077,
              "projectedCutoffMarks": 92,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "ST(P)": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 3177,
                "openingRank": 1455,
                "cutoffMarks": 88
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 3946,
                "openingRank": 2217,
                "cutoffMarks": 74
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 3200,
                "openingRank": 2033,
                "cutoffMarks": 86
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 3602,
                "openingRank": 1015,
                "cutoffMarks": 83
              }
            ],
            "projection2026": {
              "projectedClosingRank": 3239,
              "projectedCutoffMarks": 90,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "tightening"
            }
          },
          "ST(H)": {
            "history": [
              {
                "year": 2024,
                "round": 1,
                "closingRank": 3487,
                "openingRank": 2222,
                "cutoffMarks": 83
              }
            ],
            "projection2026": {
              "projectedClosingRank": 3487,
              "projectedCutoffMarks": 83,
              "confidence": "low",
              "basisYears": [
                2024
              ],
              "trend": "stable"
            }
          }
        }
      }
    ]
  },
  {
    "id": "GEC",
    "name": "Golaghat Engineering College",
    "shortName": "GEC",
    "city": "Golaghat",
    "branches": [
      {
        "branchName": "Civil Engineering",
        "categories": {
          "General": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 925,
                "openingRank": 303,
                "cutoffMarks": 141
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 1032,
                "openingRank": 621,
                "cutoffMarks": 135
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 1162,
                "openingRank": 377,
                "cutoffMarks": 137
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 974,
                "openingRank": 474,
                "cutoffMarks": 140
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1069,
              "projectedCutoffMarks": 138,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "stable"
            }
          },
          "EWS": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 846,
                "openingRank": 438,
                "cutoffMarks": 144
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 1130,
                "openingRank": 439,
                "cutoffMarks": 130
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 1247,
                "openingRank": 445,
                "cutoffMarks": 125
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 1138,
                "openingRank": 714,
                "cutoffMarks": 131
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 1421,
                "openingRank": 699,
                "cutoffMarks": 123
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 1428,
                "openingRank": 654,
                "cutoffMarks": 124
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1546,
              "projectedCutoffMarks": 123,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "OBC/MOBC": {
            "history": [
              {
                "year": 2023,
                "round": 3,
                "closingRank": 1717,
                "openingRank": 534,
                "cutoffMarks": 115
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 1313,
                "openingRank": 474,
                "cutoffMarks": 118
              }
            ],
            "projection2026": {
              "projectedClosingRank": 505,
              "projectedCutoffMarks": 124,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024
              ],
              "trend": "tightening"
            }
          },
          "ST(P)": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 3103,
                "openingRank": 1274,
                "cutoffMarks": 91
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 3385,
                "openingRank": 1376,
                "cutoffMarks": 81
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 4277,
                "openingRank": 2486,
                "cutoffMarks": 70
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 3499,
                "openingRank": 1042,
                "cutoffMarks": 76
              }
            ],
            "projection2026": {
              "projectedClosingRank": 3834,
              "projectedCutoffMarks": 71,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "stable"
            }
          },
          "ST(H)": {
            "history": [
              {
                "year": 2024,
                "round": 2,
                "closingRank": 4773,
                "openingRank": 1434,
                "cutoffMarks": 71
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 6313,
                "openingRank": 3484,
                "cutoffMarks": 54
              }
            ],
            "projection2026": {
              "projectedClosingRank": 7853,
              "projectedCutoffMarks": 37,
              "confidence": "medium",
              "basisYears": [
                2024,
                2025
              ],
              "trend": "loosening"
            }
          }
        }
      },
      {
        "branchName": "Mechanical Engineering",
        "categories": {
          "General": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 682,
                "openingRank": 222,
                "cutoffMarks": 155
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 1045,
                "openingRank": 517,
                "cutoffMarks": 136
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1771,
              "projectedCutoffMarks": 98,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024
              ],
              "trend": "loosening"
            }
          },
          "EWS": {
            "history": [
              {
                "year": 2023,
                "round": 3,
                "closingRank": 1182,
                "openingRank": 402,
                "cutoffMarks": 130
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1182,
              "projectedCutoffMarks": 130,
              "confidence": "low",
              "basisYears": [
                2023
              ],
              "trend": "stable"
            }
          },
          "OBC/MOBC": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 1029,
                "openingRank": 284,
                "cutoffMarks": 135
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 1214,
                "openingRank": 422,
                "cutoffMarks": 129
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 1233,
                "openingRank": 436,
                "cutoffMarks": 132
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1363,
              "projectedCutoffMarks": 129,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "SC": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 2286,
                "openingRank": 712,
                "cutoffMarks": 98
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 2633,
                "openingRank": 1575,
                "cutoffMarks": 92
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 2349,
                "openingRank": 766,
                "cutoffMarks": 101
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 2590,
                "openingRank": 1484,
                "cutoffMarks": 96
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 2656,
                "openingRank": 1640,
                "cutoffMarks": 94
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 2768,
                "openingRank": 1754,
                "cutoffMarks": 95
              }
            ],
            "projection2026": {
              "projectedClosingRank": 2799,
              "projectedCutoffMarks": 97,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "stable"
            }
          },
          "ST(P)": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 2934,
                "openingRank": 1369,
                "cutoffMarks": 92
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 3193,
                "openingRank": 1067,
                "cutoffMarks": 78
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 2332,
                "openingRank": 709,
                "cutoffMarks": 98
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 3074,
                "openingRank": 1885,
                "cutoffMarks": 90
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 3439,
                "openingRank": 1693,
                "cutoffMarks": 86
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 2586,
                "openingRank": 988,
                "cutoffMarks": 95
              }
            ],
            "projection2026": {
              "projectedClosingRank": 2466,
              "projectedCutoffMarks": 103,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "tightening"
            }
          },
          "ST(H)": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 3359,
                "openingRank": 1388,
                "cutoffMarks": 82
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 3752,
                "openingRank": 1854,
                "cutoffMarks": 75
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 4660,
                "openingRank": 1393,
                "cutoffMarks": 75
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 4980,
                "openingRank": 1418,
                "cutoffMarks": 61
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 5845,
                "openingRank": 3324,
                "cutoffMarks": 62
              }
            ],
            "projection2026": {
              "projectedClosingRank": 7214,
              "projectedCutoffMarks": 48,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          }
        }
      },
      {
        "branchName": "Chemical Engineering",
        "categories": {
          "General": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 929,
                "openingRank": 384,
                "cutoffMarks": 135
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 1125,
                "openingRank": 722,
                "cutoffMarks": 136
              },
              {
                "year": 2023,
                "round": 3,
                "closingRank": 1267,
                "openingRank": 817,
                "cutoffMarks": 130
              },
              {
                "year": 2024,
                "round": 2,
                "closingRank": 1152,
                "openingRank": 555,
                "cutoffMarks": 130
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 1408,
                "openingRank": 472,
                "cutoffMarks": 119
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1690,
              "projectedCutoffMarks": 97,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024
              ],
              "trend": "loosening"
            }
          },
          "EWS": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 1098,
                "openingRank": 336,
                "cutoffMarks": 134
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 1050,
                "openingRank": 395,
                "cutoffMarks": 137
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 1569,
                "openingRank": 677,
                "cutoffMarks": 119
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 1068,
                "openingRank": 313,
                "cutoffMarks": 133
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 1652,
                "openingRank": 633,
                "cutoffMarks": 114
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1994,
              "projectedCutoffMarks": 102,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          },
          "OBC/MOBC": {
            "history": [
              {
                "year": 2023,
                "round": 3,
                "closingRank": 2044,
                "openingRank": 747,
                "cutoffMarks": 112
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 1384,
                "openingRank": 742,
                "cutoffMarks": 120
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 1880,
                "openingRank": 1028,
                "cutoffMarks": 107
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 1673,
                "openingRank": 617,
                "cutoffMarks": 116
              }
            ],
            "projection2026": {
              "projectedClosingRank": 1495,
              "projectedCutoffMarks": 116,
              "confidence": "high",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "tightening"
            }
          },
          "SC": {
            "history": [
              {
                "year": 2023,
                "round": 1,
                "closingRank": 2446,
                "openingRank": 1394,
                "cutoffMarks": 102
              },
              {
                "year": 2023,
                "round": 2,
                "closingRank": 2841,
                "openingRank": 1269,
                "cutoffMarks": 96
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 2580,
                "openingRank": 793,
                "cutoffMarks": 95
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 3471,
                "openingRank": 1820,
                "cutoffMarks": 82
              }
            ],
            "projection2026": {
              "projectedClosingRank": 3786,
              "projectedCutoffMarks": 75,
              "confidence": "medium",
              "basisYears": [
                2023,
                2025
              ],
              "trend": "loosening"
            }
          },
          "ST(P)": {
            "history": [
              {
                "year": 2024,
                "round": 1,
                "closingRank": 3290,
                "openingRank": 1994,
                "cutoffMarks": 80
              },
              {
                "year": 2024,
                "round": 3,
                "closingRank": 4219,
                "openingRank": 2051,
                "cutoffMarks": 69
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 3240,
                "openingRank": 819,
                "cutoffMarks": 89
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 3900,
                "openingRank": 1436,
                "cutoffMarks": 75
              }
            ],
            "projection2026": {
              "projectedClosingRank": 3581,
              "projectedCutoffMarks": 81,
              "confidence": "medium",
              "basisYears": [
                2024,
                2025
              ],
              "trend": "tightening"
            }
          },
          "ST(H)": {
            "history": [
              {
                "year": 2023,
                "round": 2,
                "closingRank": 5437,
                "openingRank": 3021,
                "cutoffMarks": 63
              },
              {
                "year": 2024,
                "round": 1,
                "closingRank": 3944,
                "openingRank": 2044,
                "cutoffMarks": 70
              },
              {
                "year": 2025,
                "round": 1,
                "closingRank": 4521,
                "openingRank": 2899,
                "cutoffMarks": 67
              },
              {
                "year": 2025,
                "round": 2,
                "closingRank": 5176,
                "openingRank": 3312,
                "cutoffMarks": 66
              },
              {
                "year": 2025,
                "round": 3,
                "closingRank": 7186,
                "openingRank": 4646,
                "cutoffMarks": 51
              }
            ],
            "projection2026": {
              "projectedClosingRank": 7271,
              "projectedCutoffMarks": 49,
              "confidence": "medium",
              "basisYears": [
                2023,
                2024,
                2025
              ],
              "trend": "loosening"
            }
          }
        }
      }
    ]
  }
] as const;