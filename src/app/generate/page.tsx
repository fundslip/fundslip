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
    <div className="pt-20 pb-20 px-6">
      <div className="container-page">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 bg-primary-fixed rounded-2xl flex items-center justify-center mb-8">
            <Wallet className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-on-surface mb-4">
            Connect your wallet to generate a statement
          </h1>
          <p className="text-on-surface-variant text-lg mb-10 max-w-md">
            It takes less than 30 seconds. No sign-up required.
          </p>
          <button
            type="button"
            onClick={() => connect({ connector: injected() })}
            className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-10 py-5 rounded-xl font-bold text-lg shadow-lg hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Connect Wallet
          </button>
        </div>
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
    <main className="pt-20 pb-20 px-6">
      <div className="container-page">
        <header className="mb-12">
          <div className="grid md:grid-cols-2 gap-8 items-end">
            <div>
              <p className="text-sm uppercase tracking-[0.1em] text-on-surface-variant mb-2 font-semibold">
                Statement Configuration
              </p>
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter text-on-surface leading-tight">
                Generate Your <br />
                Verifiable Ledger
              </h1>
            </div>
            <BalanceCard balance={totalBalance} ensName={ensName || null} />
          </div>
        </header>

        {error && (
          <div className="mb-8 flex items-center gap-3 p-4 bg-error-container rounded-xl text-on-error-container">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
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
