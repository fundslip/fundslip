"use client";

import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useStatement } from "@/hooks/use-statement";
import { useAccount, useConnect, useEnsName } from "wagmi";
import { injected } from "wagmi/connectors";
import { Wallet, AlertCircle } from "lucide-react";
import { Suspense, useEffect } from "react";

import { BalanceCard } from "@/components/generate/balance-card";
import { PeriodSelector } from "@/components/generate/period-selector";
import { TypeSelector } from "@/components/generate/type-selector";
import { NetworkSelector } from "@/components/generate/network-selector";
import { PersonalDetailsForm } from "@/components/generate/personal-details";
import { SummaryCard } from "@/components/generate/summary-card";
import { GeneratingProgress } from "@/components/generate/generating-progress";
import { StatementResult } from "@/components/generate/statement-result";
import { downloadPdf } from "@/lib/pdf";

function ConnectWalletGate() {
  const { connect } = useConnect();

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 bg-navy/[0.06] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Wallet className="w-6 h-6 text-navy" strokeWidth={1.5} />
        </div>
        <h1 className="font-headline text-[28px] font-bold text-gray-900 mb-3">
          Connect your wallet to generate a statement
        </h1>
        <p className="text-gray-500 text-base mb-8">
          It takes less than 30 seconds. No sign-up required.
        </p>
        <button
          type="button"
          onClick={() => connect({ connector: injected() })}
          className="bg-navy text-white px-8 py-3.5 rounded-lg font-medium text-[15px] hover:bg-navy-light transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    </div>
  );
}

function GenerateContent() {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address, query: { enabled: !!address } });

  const {
    step, currentProgress, period, setPeriod, statementType, setStatementType,
    networks, toggleNetwork, statementData, verificationHash, statementId,
    totalBalance, generate, reset, customStart, setCustomStart, customEnd,
    setCustomEnd, personalDetails, setPersonalDetails, error, pdfBlobUrl, pdfBlob,
  } = useStatement();

  // Listen for reset event from navbar
  useEffect(() => {
    const handler = () => reset();
    window.addEventListener("fundslip:reset", handler);
    return () => window.removeEventListener("fundslip:reset", handler);
  }, [reset]);

  if (!isConnected) {
    return <ConnectWalletGate />;
  }

  if (step === "signing" || step === "generating") {
    return <GeneratingProgress currentStep={currentProgress} isSigning={step === "signing"} />;
  }

  if (step === "ready" && statementData && pdfBlobUrl && pdfBlob) {
    return (
      <StatementResult
        statementData={statementData}
        verificationHash={verificationHash}
        statementId={statementId}
        pdfBlobUrl={pdfBlobUrl}
        pdfBlob={pdfBlob}
        onNewStatement={reset}
        onDownload={() => downloadPdf(pdfBlobUrl, statementId)}
      />
    );
  }

  const needsPeriod = statementType !== "balance-snapshot";

  return (
    <main className="pt-24 pb-20 px-6 lg:px-8">
      <div className="container-page">
        <header className="mb-12">
          <div className="grid md:grid-cols-2 gap-8 items-end">
            <div>
              <p className="section-label mb-2">Statement Configuration</p>
              <h1 className="font-headline text-[32px] font-bold text-gray-900 leading-tight">
                Generate Your <br />Verifiable Ledger
              </h1>
            </div>
            <BalanceCard balance={totalBalance} ensName={ensName || null} />
          </div>
        </header>

        {error && (
          <div className="mb-6 flex items-center gap-3 p-4 bg-error-light rounded-xl">
            <AlertCircle className="w-4 h-4 text-error flex-shrink-0" strokeWidth={1.5} />
            <p className="text-sm text-gray-700">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <TypeSelector selected={statementType} onSelect={setStatementType} />
            {needsPeriod && (
              <PeriodSelector
                selected={period} onSelect={setPeriod}
                customStart={customStart} customEnd={customEnd}
                onCustomStartChange={setCustomStart} onCustomEndChange={setCustomEnd}
              />
            )}
            <NetworkSelector selected={networks} onToggle={toggleNetwork} />
            <PersonalDetailsForm details={personalDetails} onChange={setPersonalDetails} />
          </div>

          <div className="lg:col-span-1">
            <SummaryCard
              period={period} type={statementType} network="Ethereum"
              ensName={ensName || null} personalDetails={personalDetails}
              customStart={customStart} customEnd={customEnd}
              onGenerate={generate} isGenerating={false}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function GeneratePage() {
  return (
    <Providers>
      <Navbar />
      <Suspense>
        <GenerateContent />
      </Suspense>
      <Footer />
    </Providers>
  );
}
