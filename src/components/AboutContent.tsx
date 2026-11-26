import { Code } from "lucide-react";
import { OnboardingGuide } from "@/components/OnboardingGuide";
import { LinkCallout } from "@/components/LinkCallout";
import { SOURCE_CODE_URL } from "@/lib/constants";
export function AboutContent() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <OnboardingGuide />
      <div className="space-y-3">
        <LinkCallout
          href={SOURCE_CODE_URL}
          icon={<Code className="size-5" />}
          title={`Source code`}
          description={`Prawnstars MTG is the Prawnstars pod's private Magic table, built on the open-source Manabrew client (AGPL-3.0). The full source is on GitHub.`}
        />
      </div>
    </div>
  );
}
