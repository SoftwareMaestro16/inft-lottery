import { FC, useEffect, useState } from "react";
import { WebApp } from "./sdk";

interface MainButtonProps {
  disabled?: boolean;
  progress?: boolean;
  color?: string;
  textColor?: string;
  onClick: VoidFunction;
  text: string;
}

const mainButton = WebApp.MainButton;
const { button_color, button_text_color } = WebApp.themeParams;

export const MainButton: FC<MainButtonProps> = ({
  disabled,
  color,
  textColor,
  text,
  onClick,
  progress,
}) => {
  const [_, forceUpdate] = useState(false);

  useEffect(() => {
    forceUpdate((prev) => !prev); // Force update

    return () => {
      mainButton.hide();
      mainButton.enable();
      mainButton.hideProgress();
      mainButton.setParams({
        color: button_color,
        text_color: button_text_color,
      });
    };
  }, []);

  useEffect(() => {
    if (typeof progress === "boolean") {
      if (progress) {
        mainButton.showProgress();
        mainButton.disable(); // Disable button when showing progress
      } else {
        mainButton.hideProgress();
        mainButton.enable();  // Re-enable button once progress is hidden
      }
    }
    if (typeof disabled === "boolean") {
      disabled || progress ? mainButton.disable() : mainButton.enable();
    }
  }, [disabled, progress]);

  useEffect(() => {
    if (color || textColor) {
      mainButton.setParams({ color, text_color: textColor });
    }
  }, [color, textColor]);

  useEffect(() => {
    if (text) {
      mainButton.setText(text);
      !mainButton.isVisible && mainButton.show();
    } else if (mainButton.isVisible) {
      mainButton.hide();
    }
  }, [text]);

  useEffect(() => {
    if (onClick) {
      WebApp.MainButton.onClick(onClick);
      return () => {
        WebApp.MainButton.offClick(onClick);
      };
    }
  }, [onClick]);

  return null;
};
