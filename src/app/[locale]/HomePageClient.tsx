"use client";

import { useState, Suspense, lazy } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Clock,
  Crown,
  Gamepad2,
  Lightbulb,
  Skull,
  Sparkles,
  Swords,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useMessages } from "next-intl";
import { VideoFeature } from "@/components/home/VideoFeature";
import { LatestGuidesAccordion } from "@/components/home/LatestGuidesAccordion";
import { NativeBannerAd, AdBanner } from "@/components/ads";
import { getPreferredMobileBannerSelection } from "@/components/ads/mobileAdConfigs";
// import { SidebarAd } from "@/components/ads/SidebarAd";
import { scrollToSection } from "@/lib/scrollToSection";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { ContentItemWithType } from "@/lib/getLatestArticles";
import type { ModuleLinkMap } from "@/lib/buildModuleLinkMap";

// Lazy load heavy components
const HeroStats = lazy(() => import("@/components/home/HeroStats"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-64" }: { height?: string }) => (
  <div
    className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`}
  />
);

// Conditionally render text as a link or plain span
function LinkedTitle({
  linkData,
  children,
  className,
  locale,
}: {
  linkData: { url: string; title: string } | null | undefined;
  children: React.ReactNode;
  className?: string;
  locale: string;
}) {
  if (linkData) {
    const href = locale === "en" ? linkData.url : `/${locale}${linkData.url}`;
    return (
      <Link
        href={href}
        className={`${className || ""} hover:text-[hsl(var(--nav-theme-light))] hover:underline decoration-[hsl(var(--nav-theme-light))/0.4] underline-offset-4 transition-colors`}
        title={linkData.title}
      >
        {children}
      </Link>
    );
  }
  return <>{children}</>;
}

// 模块标题区：图标圆框 + 标题 + 简介，统一视觉
function ModuleHeader({
  icon,
  title,
  intro,
  linkData,
  locale,
}: {
  icon: React.ReactNode;
  title: string;
  intro: string;
  linkData: { url: string; title: string } | null | undefined;
  locale: string;
}) {
  return (
    <div className="mb-8 text-center scroll-reveal md:mb-12">
      <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] md:h-16 md:w-16">
        {icon}
      </div>
      <h2 className="mb-3 text-3xl font-bold md:mb-4 md:text-5xl">
        <LinkedTitle linkData={linkData} locale={locale}>
          {title}
        </LinkedTitle>
      </h2>
      <p className="mx-auto max-w-3xl text-base text-muted-foreground md:text-lg">
        {intro}
      </p>
    </div>
  );
}

interface HomePageClientProps {
  latestArticles: ContentItemWithType[];
  moduleLinkMap: ModuleLinkMap;
  locale: string;
}

export default function HomePageClient({
  latestArticles,
  moduleLinkMap,
  locale,
}: HomePageClientProps) {
  const t = useMessages() as any;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.hellholewiki.wiki";

  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Hellhole Wiki",
        description:
          "Hellhole Wiki provides horror game guides, walkthroughs, secrets, gameplay tips, and updates to help players explore the dark world of Hellhole, the Roblox PvE horror shooter.",
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1023,
          height: 576,
          caption: "Hellhole - Roblox PvE Horror Shooter",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Hellhole Wiki",
        alternateName: "Hellhole",
        url: siteUrl,
        description:
          "Hellhole Wiki resource hub for guides, walkthroughs, secrets, enemies, weapons, and survival tips for the Roblox PvE horror shooter Hellhole",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1023,
          height: 576,
          caption: "Hellhole Wiki - Roblox PvE Horror Shooter",
        },
        sameAs: [
          "https://www.roblox.com/games/84568117169118/Hellhole",
        ],
      },
      {
        "@type": "VideoGame",
        name: "Hellhole",
        gamePlatform: ["Roblox", "PC"],
        applicationCategory: "Game",
        genre: ["Horror", "Shooter", "PvE", "Survival"],
        numberOfPlayers: {
          minValue: 1,
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://www.roblox.com/games/84568117169118/Hellhole",
        },
      },
      {
        "@type": "VideoObject",
        name: "Hellhole - Full Gameplay Guide",
        description:
          "Hellhole full gameplay guide covering enemies, upgrades, money, and survival strategies for the Roblox PvE horror shooter.",
        uploadDate: "2025-11-01",
        thumbnailUrl: `${siteUrl}/images/hero.webp`,
        embedUrl: "https://www.youtube.com/embed/qZklb4F036k",
        url: "https://www.youtube.com/watch?v=qZklb4F036k",
      },
    ],
  };

  // Accordion states
  const [tipsExpanded, setTipsExpanded] = useState<number | null>(null);
  const [updatesExpanded, setUpdatesExpanded] = useState<number | null>(null);
  const mobileBannerAd = getPreferredMobileBannerSelection();

  return (
    <div className="home-shell min-h-screen bg-background text-foreground">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 左侧广告容器 - Fixed 定位 */}
      {/* <aside
        className="hidden xl:block fixed top-20 w-40 z-10"
        style={{ left: "calc((100vw - 896px) / 2 - 180px)" }}
      >
        <SidebarAd
          type="sidebar-160x300"
          adKey={process.env.NEXT_PUBLIC_AD_SIDEBAR_160X300}
        />
      </aside> */}

      {/* 右侧广告容器 - Fixed 定位 */}
      {/* <aside
        className="hidden xl:block fixed top-20 w-40 z-10"
        style={{ right: "calc((100vw - 896px) / 2 - 180px)" }}
      >
        <SidebarAd
          type="sidebar-160x600"
          adKey={process.env.NEXT_PUBLIC_AD_SIDEBAR_160X600}
        />
      </aside> */}

      {/* 广告位 1: 顶部固定横幅 */}
      <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-24 pb-14 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 scroll-reveal">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 md:px-4 md:py-2
                            bg-[hsl(var(--nav-theme)/0.1)]
                            border border-[hsl(var(--nav-theme)/0.3)] mb-4 md:mb-6"
            >
              <Sparkles className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-xs md:text-sm font-medium">
                {t.hero.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-[1.05]">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:mb-10 md:max-w-3xl md:text-2xl">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:mb-12 md:gap-4">
              <button
                onClick={() => scrollToSection("beginner-guide")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           bg-[hsl(var(--nav-theme))] hover:bg-[hsl(var(--nav-theme)/0.9)]
                           text-white rounded-lg font-semibold text-base md:text-lg transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                {t.hero.getFreeCodesCTA}
              </button>
              <a
                href="https://www.roblox.com/games/84568117169118/Hellhole"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           border border-border hover:bg-white/10 rounded-lg
                           font-semibold text-base md:text-lg transition-colors"
              >
                {t.hero.playOnSteamCTA}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* Video Section */}
      <section className="px-4 py-10 md:py-12">
        <div className="container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl">
            <VideoFeature
              videoId="qZklb4F036k"
              title="Hellhole - Full Gameplay Guide"
            />
          </div>
        </div>
      </section>

      {/* Tools Grid - 8 Navigation Cards */}
      <section className="px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.tools.title}{" "}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {t.tools.cards.map((card: any, index: number) => {
              // 映射卡片索引到 section ID（与 8 个模块锚点一一对应）
              const sectionIds = [
                "beginner-guide",
                "gameplay-guide",
                "weapons-guide",
                "enemies-guide",
                "tips-and-tricks",
                "boss-guide",
                "upgrades-and-progress",
                "updates-and-news",
              ];
              const sectionId = sectionIds[index];

              return (
                <button
                  key={index}
                  onClick={() => scrollToSection(sectionId)}
                  className="scroll-reveal group rounded-xl border border-border p-4 md:p-6
                             bg-card hover:border-[hsl(var(--nav-theme)/0.5)]
                             transition-all duration-300 cursor-pointer text-left
                             hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="mb-3 h-10 w-10 rounded-lg md:mb-4 md:h-12 md:w-12
                                  bg-[hsl(var(--nav-theme)/0.1)]
                                  flex items-center justify-center
                                  group-hover:bg-[hsl(var(--nav-theme)/0.2)]
                                  transition-colors"
                  >
                    <DynamicIcon
                      name={card.icon}
                      className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--nav-theme-light))]"
                    />
                  </div>
                  <h3 className="mb-1.5 text-sm md:text-base font-semibold">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest Updates Section */}
      <LatestGuidesAccordion
        articles={latestArticles}
        locale={locale}
        max={12}
      />

      {/* 广告位 2: 首屏内容之后再加载广告 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      {/* 广告位 3: 移动端优先使用方形，桌面端保留横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Module 1: Beginner Guide (step-by-step) */}
      <section id="beginner-guide" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={<BookOpen className="h-7 w-7 text-[hsl(var(--nav-theme-light))] md:h-8 md:w-8" />}
            title={t.modules.hellholeBeginnerGuide.title}
            intro={t.modules.hellholeBeginnerGuide.intro}
            linkData={moduleLinkMap["hellholeBeginnerGuide"]}
            locale={locale}
          />

          {/* Steps */}
          <div className="scroll-reveal space-y-3 md:space-y-4 mb-8 md:mb-10">
            {t.modules.hellholeBeginnerGuide.steps.map(
              (step: any, index: number) => (
                <div
                  key={index}
                  className="flex gap-3 md:gap-4 p-4 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)]">
                    <span className="text-base md:text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-bold mb-1.5 md:mb-2">
                      <LinkedTitle
                        linkData={
                          moduleLinkMap[
                            `hellholeBeginnerGuide::steps::${index}`
                          ]
                        }
                        locale={locale}
                      >
                        {step.title}
                      </LinkedTitle>
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>

          {/* Quick Tips */}
          <div className="scroll-reveal p-4 md:p-6 bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.3)] rounded-xl">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <BookOpen className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="font-bold text-base md:text-lg">Quick Tips</h3>
            </div>
            <ul className="space-y-2">
              {t.modules.hellholeBeginnerGuide.quickTips.map(
                (tip: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">{tip}</span>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* 广告位 4: 第一模块之后的阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 2: Gameplay Guide (card-list) */}
      <section id="gameplay-guide" className="scroll-mt-24 px-4 py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={<Gamepad2 className="h-7 w-7 text-[hsl(var(--nav-theme-light))] md:h-8 md:w-8" />}
            title={t.modules.hellholeGameplayGuide.title}
            intro={t.modules.hellholeGameplayGuide.intro}
            linkData={moduleLinkMap["hellholeGameplayGuide"]}
            locale={locale}
          />
          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.modules.hellholeGameplayGuide.cards.map(
              (card: any, index: number) => (
                <div
                  key={index}
                  className="p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <h3 className="font-bold text-lg mb-2 text-[hsl(var(--nav-theme-light))]">
                    <LinkedTitle
                      linkData={
                        moduleLinkMap[`hellholeGameplayGuide::cards::${index}`]
                      }
                      locale={locale}
                    >
                      {card.name}
                    </LinkedTitle>
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {card.description}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Module 3: Weapons Guide (card-list with type) */}
      <section id="weapons-guide" className="scroll-mt-24 px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={<Swords className="h-7 w-7 text-[hsl(var(--nav-theme-light))] md:h-8 md:w-8" />}
            title={t.modules.hellholeWeaponsGuide.title}
            intro={t.modules.hellholeWeaponsGuide.intro}
            linkData={moduleLinkMap["hellholeWeaponsGuide"]}
            locale={locale}
          />
          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.modules.hellholeWeaponsGuide.items.map(
              (item: any, index: number) => (
                <div
                  key={index}
                  className="p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Swords className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                    <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                      {item.type}
                    </span>
                  </div>
                  <h3 className="font-bold mb-2">
                    <LinkedTitle
                      linkData={
                        moduleLinkMap[`hellholeWeaponsGuide::items::${index}`]
                      }
                      locale={locale}
                    >
                      {item.name}
                    </LinkedTitle>
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {item.description}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* 广告位 6: 移动端横幅 320×50 */}
      {mobileBannerAd && (
        <AdBanner
          type={mobileBannerAd.type}
          adKey={mobileBannerAd.adKey}
          className="md:hidden"
        />
      )}

      {/* Module 4: Enemies Guide (table) */}
      <section id="enemies-guide" className="scroll-mt-24 px-4 py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={<Skull className="h-7 w-7 text-[hsl(var(--nav-theme-light))] md:h-8 md:w-8" />}
            title={t.modules.hellholeEnemiesGuide.title}
            intro={t.modules.hellholeEnemiesGuide.intro}
            linkData={moduleLinkMap["hellholeEnemiesGuide"]}
            locale={locale}
          />

          {/* 桌面端表格 */}
          <div className="scroll-reveal hidden md:block overflow-hidden rounded-xl border border-border">
            <table className="w-full">
              <thead className="bg-[hsl(var(--nav-theme)/0.1)]">
                <tr>
                  <th className="text-left p-4 font-semibold">Enemy</th>
                  <th className="text-left p-4 font-semibold">Behavior</th>
                  <th className="text-left p-4 font-semibold">Survival Strategy</th>
                </tr>
              </thead>
              <tbody>
                {t.modules.hellholeEnemiesGuide.enemies.map(
                  (e: any, index: number) => (
                    <tr key={index} className={index !== 0 ? "border-t border-border" : ""}>
                      <td className="p-4 font-semibold text-[hsl(var(--nav-theme-light))] align-top whitespace-nowrap">
                        <LinkedTitle
                          linkData={
                            moduleLinkMap[`hellholeEnemiesGuide::enemies::${index}`]
                          }
                          locale={locale}
                        >
                          {e.enemy}
                        </LinkedTitle>
                      </td>
                      <td className="p-4 text-muted-foreground text-sm align-top">{e.behavior}</td>
                      <td className="p-4 text-muted-foreground text-sm align-top">{e.strategy}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          {/* 移动端堆叠卡片 */}
          <div className="scroll-reveal md:hidden space-y-4">
            {t.modules.hellholeEnemiesGuide.enemies.map(
              (e: any, index: number) => (
                <div
                  key={index}
                  className="p-5 bg-white/5 border border-border rounded-xl"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Skull className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                    <h3 className="font-bold text-[hsl(var(--nav-theme-light))]">{e.enemy}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    <span className="font-semibold text-foreground">Behavior: </span>
                    {e.behavior}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Strategy: </span>
                    {e.strategy}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Module 5: Tips and Tricks (accordion) */}
      <section id="tips-and-tricks" className="scroll-mt-24 px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={<Lightbulb className="h-7 w-7 text-[hsl(var(--nav-theme-light))] md:h-8 md:w-8" />}
            title={t.modules.hellholeTipsAndTricks.title}
            intro={t.modules.hellholeTipsAndTricks.intro}
            linkData={moduleLinkMap["hellholeTipsAndTricks"]}
            locale={locale}
          />
          <div className="scroll-reveal space-y-2">
            {t.modules.hellholeTipsAndTricks.tips.map(
              (tip: any, index: number) => (
                <div
                  key={index}
                  className="border border-border rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setTipsExpanded(tipsExpanded === index ? null : index)
                    }
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="font-semibold">{tip.title}</span>
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 transition-transform ${tipsExpanded === index ? "rotate-180" : ""}`}
                    />
                  </button>
                  {tipsExpanded === index && (
                    <div className="px-5 pb-5 text-muted-foreground text-sm">
                      {tip.content}
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Module 6: Boss Guide (tier-grid) */}
      <section id="boss-guide" className="scroll-mt-24 px-4 py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={<Crown className="h-7 w-7 text-[hsl(var(--nav-theme-light))] md:h-8 md:w-8" />}
            title={t.modules.hellholeBossGuide.title}
            intro={t.modules.hellholeBossGuide.intro}
            linkData={moduleLinkMap["hellholeBossGuide"]}
            locale={locale}
          />
          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.modules.hellholeBossGuide.bosses.map(
              (b: any, index: number) => (
                <div
                  key={index}
                  className="p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <Crown className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                    <h3 className="font-bold">
                      <LinkedTitle
                        linkData={
                          moduleLinkMap[`hellholeBossGuide::bosses::${index}`]
                        }
                        locale={locale}
                      >
                        {b.name}
                      </LinkedTitle>
                    </h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                      {b.tier}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${b.difficulty === "Very High" ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-orange-500/10 border-orange-500/30 text-orange-400"}`}
                    >
                      {b.difficulty}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">{b.strategy}</p>
                  <p className="text-sm">
                    <span className="font-semibold">Recommended: </span>
                    <span className="text-muted-foreground">{b.recommended}</span>
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Module 7: Upgrades and Progress (code-cards) */}
      <section id="upgrades-and-progress" className="scroll-mt-24 px-4 py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={<TrendingUp className="h-7 w-7 text-[hsl(var(--nav-theme-light))] md:h-8 md:w-8" />}
            title={t.modules.hellholeUpgradesAndProgress.title}
            intro={t.modules.hellholeUpgradesAndProgress.intro}
            linkData={moduleLinkMap["hellholeUpgradesAndProgress"]}
            locale={locale}
          />
          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.modules.hellholeUpgradesAndProgress.upgrades.map(
              (u: any, index: number) => (
                <div
                  key={index}
                  className="flex gap-4 p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <div className="text-3xl md:text-4xl font-bold text-[hsl(var(--nav-theme-light))] flex-shrink-0 leading-none">
                    {u.code}
                  </div>
                  <div>
                    <h3 className="font-bold mb-2">
                      <LinkedTitle
                        linkData={
                          moduleLinkMap[`hellholeUpgradesAndProgress::upgrades::${index}`]
                        }
                        locale={locale}
                      >
                        {u.title}
                      </LinkedTitle>
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {u.description}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Module 8: Updates and News (accordion) */}
      <section id="updates-and-news" className="scroll-mt-24 px-4 py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={<Clock className="h-7 w-7 text-[hsl(var(--nav-theme-light))] md:h-8 md:w-8" />}
            title={t.modules.hellholeUpdatesAndNews.title}
            intro={t.modules.hellholeUpdatesAndNews.intro}
            linkData={moduleLinkMap["hellholeUpdatesAndNews"]}
            locale={locale}
          />
          <div className="scroll-reveal space-y-2">
            {t.modules.hellholeUpdatesAndNews.updates.map(
              (item: any, index: number) => (
                <div
                  key={index}
                  className="border border-border rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setUpdatesExpanded(updatesExpanded === index ? null : index)
                    }
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="font-semibold">{item.title}</span>
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 transition-transform ${updatesExpanded === index ? "rotate-180" : ""}`}
                    />
                  </button>
                  {updatesExpanded === index && (
                    <div className="px-5 pb-5 text-muted-foreground text-sm">
                      {item.content}
                    </div>
                  )}
                </div>
              ),
            )}
          </div>

          {/* 外部参考链接 */}
          <div className="scroll-reveal mt-10 flex flex-wrap justify-center gap-3">
            <a
              href="https://www.roblox.com/games/84568117169118/Hellhole"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-sm hover:bg-[hsl(var(--nav-theme)/0.2)] transition-colors"
            >
              <Gamepad2 className="w-4 h-4" /> Play Hellhole on Roblox
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner 3 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Footer */}
      <footer className="bg-white/[0.02] border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.footer.description}
              </p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.roblox.com/games/84568117169118/Hellhole"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.discord}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/watch?v=qZklb4F036k"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.twitter}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.roblox.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.steamCommunity}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/watch?v=mPnmG7ZqwrA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.steamStore}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {t.footer.copyright}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
