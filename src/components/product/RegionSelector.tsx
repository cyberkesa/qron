"use client";

import { Fragment } from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { Region } from "@/types/api";

interface RegionSelectorProps {
  show: boolean;
  regions: Region[];
  currentRegion: Region | null;
  onRegionSelect: (region: Region) => void;
  onClose: () => void;
}

const RegionSelector = ({
  show,
  regions,
  currentRegion,
  onRegionSelect,
  onClose,
}: RegionSelectorProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div
          className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          <div>
            <div className="flex justify-between items-start mb-5">
              <h3
                className="text-lg leading-6 font-medium text-gray-900"
                id="modal-headline"
              >
                Выберите регион
              </h3>
              <button
                onClick={onClose}
                className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <span className="sr-only">Закрыть</span>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-5 text-sm text-blue-800">
              <div className="flex">
                <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                <p>
                  Выбор региона влияет на наличие товаров и сроки доставки. Мы
                  используем эту информацию для более точного отображения
                  ассортимента.
                </p>
              </div>
            </div>

            <div className="mt-4 max-h-60 overflow-y-auto">
              <div className="grid grid-cols-1 gap-3">
                {regions.map((region) => (
                  <button
                    key={region.id}
                    className={`p-3 border text-left rounded-lg transition-colors ${
                      currentRegion?.id === region.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => onRegionSelect(region)}
                  >
                    {region.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-6">
            <button
              type="button"
              className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
              onClick={onClose}
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegionSelector;
