import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { tools } from "@/lib/categories";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    // Find category data
    const categoryData = tools.find((tool) => tool.id === category);

    // Generate title and subtitle based on path type
    let title = "Free Tools";
    let subtitle = "Post Free, Find Easy";
    let bgGradient = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";

    if (category && category !== "all") {
      if (categoryData) {
        // Valid category found
        const categoryName = categoryData.name;
        const categoryEmoji = categoryData.emoji;
        bgGradient = categoryData.gradient;

        title = `${categoryEmoji} ${categoryName}`;
        subtitle = "Free Tools - Post Free, Find Easy";
      } else {
        // Invalid category - show as homepage
        title = "Free Tools";
        subtitle = "Post Free, Find Easy";
      }
    }

    return new ImageResponse(
      (
        <div
          style={{
            background: bgGradient,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            padding: "80px 60px",
            position: "relative",
            overflow: "hidden",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)",
          }}
        >
          {/* Background decorative elements */}
          <div
            style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.05)",
              display: "block",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-30px",
              left: "-30px",
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.03)",
              display: "block",
            }}
          />
          {/* Animated pattern overlay */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 40%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 40%)",
              display: "block",
            }}
          />

          {/* Content */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Logo with enhanced styling - only show when title is not Free Tools */}
            {title !== "Free Tools" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "96px",
                  fontWeight: 900,
                  marginBottom: "40px",
                  gap: "20px",
                  color: "white",
                  textShadow: "0 4px 8px rgba(0,0,0,0.3)",
                }}
              >
                <span
                // style={{
                //   color: "white",
                //   background: "rgba(255,255,255,0.2)",
                //   padding: "8px 16px",
                //   borderRadius: "12px",
                //   backdropFilter: "blur(10px)",
                // }}
                >
                  Free Tools
                </span>
                <span
                // style={{
                //   color: "white",
                //   background: "rgba(255,255,255,0.3)",
                //   padding: "8px 16px",
                //   borderRadius: "12px",
                //   backdropFilter: "blur(10px)",
                // }}
                >
                  Now
                </span>
                <span
                  style={{
                    fontSize: "88px",
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                  }}
                >
                  �️
                </span>
              </div>
            )}

            {/* Main title with stronger presence */}
            <h1
              style={{
                fontSize: "140px",
                fontWeight: 900,
                color: "white",
                margin: title === "Free Tools" ? "0 0 40px 0" : "0 0 40px 0",
                lineHeight: 0.9,
                textAlign: "center",
                maxWidth: "1000px",
                textShadow:
                  "0 4px 12px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)",
                letterSpacing: "-0.02em",
              }}
            >
              {title} {title === "Free Tools" && "�️"}
            </h1>

            {/* Subtitle with pill background */}
            <div
              style={{
                background: "rgba(255,255,255,0.12)",
                padding: "20px 40px",
                borderRadius: "60px",
                backdropFilter: "blur(60px) saturate(180%)",
                border: "1px solid rgba(255,255,255,0.3)",
                boxShadow:
                  "0 12px 40px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(255,255,255,0.1)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Additional glass layer */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 100%)",
                  borderRadius: "60px",
                  display: "block",
                }}
              />
              <p
                style={{
                  fontSize: "48px",
                  color: "white",
                  margin: 0,
                  fontWeight: 700,
                  textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {subtitle}
              </p>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
