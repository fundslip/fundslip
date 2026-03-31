"use client";

import { useStatement } from "@/hooks/use-statement";
import { useAccount } from "wagmi";
import { useCachedEnsName } from "@/hooks/use-cached-ens";
import { Wallet, AlertCircle, Loader2 } from "lucide-react";
import { Suspense } from "react";

import { BalanceCard } from "@/components/generate/balance-card";
import { PeriodSelector } from "@/components/generate/period-selector";
import { TypeSelector } from "@/components/generate/type-selector";
import { ConnectedNetwork } from "@/components/generate/network-selector";
import { PersonalDetailsForm } from "@/components/generate/personal-details";
import { SummaryCard } from "@/components/generate/summary-card";
import { GeneratingProgress } from "@/components/generate/generating-progress";
import { StatementResult } from "@/components/generate/statement-result";
import { WalletOptions } from "@/components/shared/wallet-options";
import { downloadPdf } from "@/lib/pdf";
import { getNetworkName } from "@/lib/ethereum";
import { trackDownloadPdf } from "@/lib/analytics";

function ConnectWalletGate() {
  return (
    <div className="pt-24 pb-20 px-5">
      <div className="container-page flex flex-col items-center pt-16 text-center">
        <Wallet className="w-8 h-8 text-on-surface-variant mb-6" />
        <h1 className="font-headline text-2xl md:text-3xl font-semibold text-brand-black mb-3">
          Connect your wallet
        </h1>
        <p className="text-on-surface-variant text-[15px] mb-8 max-w-sm">
          It takes less than 30 seconds. No sign-up required.
        </p>
        <WalletOptions layout="page" />
      </div>
    </div>
  );
}

function GenerateContent() {
  const { address, isConnected } = useAccount();
  const ensName = useCachedEnsName(address);
  const {
    step, currentProgress, period, setPeriod, statementType, setStatementType,
    chainId, statementData, verificationHash, statementId,
    totalBalance, balanceLoaded, generate, reset, customStart, setCustomStart, customEnd,
    setCustomEnd, personalDetails, setPersonalDetails, error, pdfBlobUrl, pdfBlob,
  } = useStatement();
  const isGenerating = step === "signing" || step === "generating";

  if (!isConnected) return <ConnectWalletGate />;
  if (isGenerating) return <GeneratingProgress currentStep={currentProgress} isSigning={step === "signing"} />;
  if (step === "ready" && statementData && pdfBlobUrl && pdfBlob) {
    return <StatementResult statementData={statementData} verificationHash={verificationHash}
      statementId={statementId} pdfBlobUrl={pdfBlobUrl} pdfBlob={pdfBlob}
      onNewStatement={reset} onDownload={() => { trackDownloadPdf(); downloadPdf(pdfBlobUrl, statementId); }} />;
  }

  return (
    <main className="pt-20 pb-20 px-5 md:px-6">
      <div className="container-page">
        <header className="mb-10">
          <div className="grid md:grid-cols-2 gap-6 items-end">
            <div>
              <p className="text-xs uppercase tracking-wide text-on-surface-variant mb-2">Configure</p>
              <h1 className="font-headline text-2xl md:text-3xl font-semibold text-brand-black">Generate Statement</h1>
            </div>
            <BalanceCard balance={totalBalance} loaded={balanceLoaded} />
          </div>
        </header>

        {error && (
          <div className="mb-6 flex items-center gap-3 p-3 border-l-2 border-error bg-white rounded-lg text-sm text-on-error-container">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-error" /> {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <TypeSelector selected={statementType} onSelect={setStatementType} />
            {statementType !== "balance-snapshot" && (
              <PeriodSelector selected={period} onSelect={setPeriod}
                customStart={customStart} customEnd={customEnd}
                onCustomStartChange={setCustomStart} onCustomEndChange={setCustomEnd} />
            )}
            <ConnectedNetwork chainId={chainId} />
            <PersonalDetailsForm details={personalDetails} onChange={setPersonalDetails} />
          </div>
          <div className="lg:col-span-1">
            <SummaryCard period={period} type={statementType} network={getNetworkName(chainId)}
              ensName={ensName || null} personalDetails={personalDetails}
              customStart={customStart} customEnd={customEnd}
              onGenerate={generate} isGenerating={isGenerating} />
          </div>
        </div>
      </div>
    </main>
  );
}

function PageLoader() {
  return (
    <div className="pt-24 pb-20 flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-6 h-6 text-on-surface-variant animate-spin" />
    </div>
  );
}

export default function GeneratePage() {
  return <Suspense fallback={<PageLoader />}><GenerateContent /></Suspense>;
}
