import { useCallback, useRef } from "react";
import type { Application } from "pixi.js";

import { BoardCanvasSurface, type BoardCanvasProps } from "./BoardCanvas";
import { MOBILE_BATTLEFIELD_LAYOUT } from "./board/MobileBattlefieldLayout";
import type { BoardScene } from "./board/BoardScene";
import { MobileBoardScene } from "./board/MobileBoardScene";
import type { GameCanvasCallbacks } from "./types";

export interface MobileBoardCanvasProps extends BoardCanvasProps {
  mobileHandOpen?: boolean;
  mobileHandPeek?: boolean;
  mobileHandControlBounds?: DOMRect | null;
}

function createMobileBoardScene(
  app: Application,
  callbacks: GameCanvasCallbacks,
): MobileBoardScene {
  return new MobileBoardScene(app, callbacks);
}

export function MobileBoardCanvas({
  mobileHandOpen = false,
  mobileHandPeek = false,
  mobileHandControlBounds,
  ...props
}: MobileBoardCanvasProps) {
  // Cards are usually played with the hand open, and placed cards never move
  // again. Keep the closed hand button's spot blocked while the hand is open
  // too, or a new land lands under the button and looks like it never played.
  const closedControlBounds = useRef<DOMRect | null>(null);
  const syncScenePresentation = useCallback(
    (scene: BoardScene, canvas: HTMLCanvasElement) => {
      const mobileScene = scene as MobileBoardScene;
      mobileScene.setMobileHandOpen(mobileHandOpen);
      mobileScene.setHandPeek(mobileHandPeek);
      const canvasBounds = canvas.getBoundingClientRect();
      if (!mobileHandOpen && mobileHandControlBounds) {
        closedControlBounds.current = mobileHandControlBounds;
      }
      const control = mobileHandOpen ? closedControlBounds.current : mobileHandControlBounds;
      mobileScene.setMobileHandControlBlocker(
        control
          ? {
              x: control.left - canvasBounds.left,
              y: control.top - canvasBounds.top,
              width: control.width,
              height: control.height,
            }
          : null,
      );
    },
    [mobileHandControlBounds, mobileHandOpen, mobileHandPeek],
  );

  return (
    <BoardCanvasSurface
      {...props}
      layoutPolicy={MOBILE_BATTLEFIELD_LAYOUT}
      createScene={createMobileBoardScene}
      syncScenePresentation={syncScenePresentation}
    />
  );
}
