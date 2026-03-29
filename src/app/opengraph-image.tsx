import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "Fundslip — Bank Statements for Ethereum. Verifiable.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* LEFT SIDE: brand + headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingLeft: 72,
            paddingRight: 40,
            width: 580,
          }}
        >
          {/* Logo + wordmark */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 48,
            }}
          >
            <div
              style={{
                width: 24,
                height: 30,
                borderRadius: 5,
                backgroundColor: "#003499",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 2,
                  backgroundColor: "rgba(255,255,255,0.8)",
                  borderRadius: 1,
                }}
              />
              <div
                style={{
                  width: 8,
                  height: 1.5,
                  backgroundColor: "rgba(255,255,255,0.3)",
                  borderRadius: 1,
                }}
              />
              <div
                style={{
                  width: 10,
                  height: 1.5,
                  backgroundColor: "rgba(255,255,255,0.3)",
                  borderRadius: 1,
                }}
              />
            </div>
            <span
              style={{
                fontSize: 24,
                fontWeight: 600,
                color: "#1d1d1f",
                letterSpacing: -0.5,
              }}
            >
              Fundslip
            </span>
          </div>

          {/* Headline */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span
              style={{
                fontSize: 50,
                fontWeight: 600,
                color: "#1d1d1f",
                letterSpacing: -1.5,
                lineHeight: 1.15,
              }}
            >
              Bank Statements
            </span>
            <span
              style={{
                fontSize: 50,
                fontWeight: 600,
                color: "#1d1d1f",
                letterSpacing: -1.5,
                lineHeight: 1.15,
              }}
            >
              for Ethereum.
            </span>
            <span
              style={{
                fontSize: 50,
                fontWeight: 600,
                color: "#86868b",
                letterSpacing: -1.5,
                lineHeight: 1.15,
              }}
            >
              Verifiable.
            </span>
          </div>

          {/* Subtitle */}
          <span
            style={{
              fontSize: 18,
              color: "#86868b",
              marginTop: 24,
            }}
          >
            EIP-712 signed. Anyone can verify. No backend.
          </span>

          {/* Trust indicators */}
          <div
            style={{
              display: "flex",
              gap: 20,
              marginTop: 28,
            }}
          >
            {["Open Source", "Free Forever"].map((label) => (
              <div
                key={label}
                style={{ display: "flex", alignItems: "center", gap: 6 }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: "#85f8c4",
                  }}
                />
                <span style={{ fontSize: 13, color: "#86868b" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE: statement card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "absolute",
            right: 36,
            top: 36,
            width: 512,
            height: 558,
            borderRadius: 16,
            border: "1px solid #e5e5ea",
            backgroundColor: "#ffffff",
            padding: 24,
          }}
        >
          {/* Card header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 14,
                  height: 17,
                  borderRadius: 3,
                  backgroundColor: "#003499",
                }}
              />
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#1d1d1f",
                }}
              >
                Fundslip
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                backgroundColor: "rgba(133,248,196,0.15)",
                borderRadius: 9,
                padding: "3px 10px",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "#85f8c4",
                }}
              />
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 500,
                  color: "#003499",
                  letterSpacing: 0.5,
                }}
              >
                VERIFIED
              </span>
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              width: "100%",
              height: 1,
              backgroundColor: "#e5e5ea",
              marginBottom: 14,
            }}
          />

          {/* Account row */}
          <div
            style={{
              display: "flex",
              gap: 48,
              marginBottom: 16,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span
                style={{
                  fontSize: 8,
                  color: "#86868b",
                  letterSpacing: 0.6,
                }}
              >
                ACCOUNT
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: "#1d1d1f",
                  fontFamily: "monospace",
                }}
              >
                sshdopey.eth
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span
                style={{
                  fontSize: 8,
                  color: "#86868b",
                  letterSpacing: 0.6,
                }}
              >
                NETWORK
              </span>
              <span style={{ fontSize: 12, color: "#1d1d1f" }}>Ethereum</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span
                style={{
                  fontSize: 8,
                  color: "#86868b",
                  letterSpacing: 0.6,
                }}
              >
                BLOCK
              </span>
              <span style={{ fontSize: 12, color: "#1d1d1f" }}>
                #21,842,306
              </span>
            </div>
          </div>

          {/* Net worth box */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#f5f5f7",
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontSize: 8,
                color: "#86868b",
                letterSpacing: 0.6,
                marginBottom: 6,
              }}
            >
              TOTAL NET WORTH
            </span>
            <span
              style={{
                fontSize: 30,
                fontWeight: 600,
                color: "#1d1d1f",
                letterSpacing: -0.5,
              }}
            >
              $142,502
              <span style={{ color: "#86868b", opacity: 0.3 }}>.88</span>
            </span>
          </div>

          {/* Holdings label */}
          <span
            style={{
              fontSize: 8,
              color: "#86868b",
              letterSpacing: 0.6,
              marginBottom: 4,
            }}
          >
            HOLDINGS
          </span>
          <div
            style={{
              width: "100%",
              height: 1,
              backgroundColor: "#e5e5ea",
              marginBottom: 10,
            }}
          />

          {/* ETH row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  backgroundColor: "#1d1d1f",
                }}
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <span
                  style={{ fontSize: 12, fontWeight: 500, color: "#1d1d1f" }}
                >
                  Ethereum
                </span>
                <span style={{ fontSize: 9, color: "#86868b" }}>
                  32.4500 ETH
                </span>
              </div>
            </div>
            <span style={{ fontSize: 12, color: "#1d1d1f" }}>$84,120.00</span>
          </div>

          <div
            style={{
              width: "100%",
              height: 1,
              backgroundColor: "#e5e5ea",
              opacity: 0.5,
              marginBottom: 10,
            }}
          />

          {/* USDC row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  backgroundColor: "#3E73C4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#ffffff",
                  }}
                >
                  $
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <span
                  style={{ fontSize: 12, fontWeight: 500, color: "#1d1d1f" }}
                >
                  USD Coin
                </span>
                <span style={{ fontSize: 9, color: "#86868b" }}>
                  58,382.88 USDC
                </span>
              </div>
            </div>
            <span style={{ fontSize: 12, color: "#1d1d1f" }}>$58,382.88</span>
          </div>

          <div
            style={{
              width: "100%",
              height: 1,
              backgroundColor: "#e5e5ea",
              opacity: 0.5,
              marginBottom: 10,
            }}
          />

          {/* Total row */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 16,
              backgroundColor: "#f5f5f7",
              borderRadius: 4,
              padding: "6px 12px",
              marginBottom: 20,
            }}
          >
            <span style={{ fontSize: 10, color: "#86868b" }}>Total</span>
            <span
              style={{ fontSize: 12, fontWeight: 600, color: "#003499" }}
            >
              $142,502.88
            </span>
          </div>

          {/* Transactions */}
          <span
            style={{
              fontSize: 8,
              color: "#86868b",
              letterSpacing: 0.6,
              marginBottom: 4,
            }}
          >
            RECENT TRANSACTIONS
          </span>
          <div
            style={{
              width: "100%",
              height: 1,
              backgroundColor: "#e5e5ea",
              marginBottom: 8,
            }}
          />

          {[
            {
              name: "Received ETH",
              from: "Mar 15 from vitalik.eth",
              amount: "+$4,280.00",
            },
            {
              name: "Sent USDC",
              from: "Mar 12 to nick.eth",
              amount: "-$2,500.00",
            },
          ].map((tx, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <span style={{ fontSize: 11, color: "#1d1d1f" }}>
                  {tx.name}
                </span>
                <span style={{ fontSize: 9, color: "#86868b" }}>
                  {tx.from}
                </span>
              </div>
              <span style={{ fontSize: 11, color: "#1d1d1f" }}>
                {tx.amount}
              </span>
            </div>
          ))}

          {/* Card footer */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: "auto",
            }}
          >
            <div
              style={{
                width: "100%",
                height: 1,
                backgroundColor: "#e5e5ea",
                marginBottom: 12,
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                <span
                  style={{ fontSize: 10, fontWeight: 500, color: "#1d1d1f" }}
                >
                  Verify this statement
                </span>
                <span style={{ fontSize: 9, color: "#003499" }}>
                  fundslip.xyz/verify
                </span>
                <span
                  style={{
                    fontSize: 7,
                    color: "#86868b",
                    fontFamily: "monospace",
                  }}
                >
                  EIP-712 Signed · No server involved
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom left URL */}
        <span
          style={{
            position: "absolute",
            bottom: 28,
            left: 72,
            fontSize: 13,
            color: "#86868b",
          }}
        >
          fundslip.xyz
        </span>
      </div>
    ),
    { ...size }
  );
}
