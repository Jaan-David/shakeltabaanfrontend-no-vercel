"use client";
import React, { useState, useEffect } from "react";
import Alert from "@/components/UI/Alert/alert";
import AlertHandlerService, { AlertConfig } from "@/services/Utils/alertHandler";

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    AlertHandlerService.setHandler((config: AlertConfig) => {
      setAlertConfig(config);
      setIsOpen(true);
    });

    return () => {
      AlertHandlerService.clearHandler();
    };
  }, []);

  const handleClose = () => setIsOpen(false);
  const resolveButtons = (config: AlertConfig | null) => {
    if (!config?.buttons) return config?.buttons;
    return config.buttons.map((button) => ({
      ...button,
      onClick: () => {
        button.onClick();
        handleClose();
      },
    }));
  };

  return (
    <>
      {children}
      {isOpen && alertConfig && (
        <Alert
          isOpen={isOpen}
          message={alertConfig.message}
          type={alertConfig.type}
          buttons={resolveButtons(alertConfig)}
          setClose={handleClose}
          onConfirm={() => {
            alertConfig.onConfirm?.();
            handleClose();
          }}
          onCancel={() => {
            alertConfig.onCancel?.();
            handleClose();
          }}
        />
      )}
    </>
  );
};

export default AlertProvider;