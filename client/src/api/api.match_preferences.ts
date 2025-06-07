import api, { handleApiError } from "./api";
import { AxiosResponse } from "axios";

interface MatchType {
  match_type_id: string;
  match_type_name: string;
  match_type_description: string;
}

/**
 * Pobiera wszystkie typy dopasowań
 * @returns Promise z tablicą typów dopasowań
 */
export const getAllMatchTypes = async (): Promise<MatchType[]> => {
  try {
    const response: AxiosResponse<MatchType[]> = await api.get(
      "api/match-preferences/types",
    );
    return response.data;
  } catch (error) {
    handleApiError(error, "Błąd podczas pobierania typów dopasowań");
    throw error;
  }
};

/**
 * Pobiera preferencje dopasowań dla aktualnego użytkownika
 * @returns Promise z tablicą wybranych typów dopasowań
 */
export const getUserMatchPreferences = async (): Promise<MatchType[]> => {
  try {
    const response: AxiosResponse<MatchType[]> = await api.get(
      "api/match-preferences/user",
    );
    return response.data;
  } catch (error) {
    handleApiError(error, "Błąd podczas pobierania preferencji dopasowań");
    throw error;
  }
};

/**
 * Aktualizuje preferencje dopasowań dla aktualnego użytkownika
 * @param matchTypeIds Array ID typów dopasowań do ustawienia
 * @returns Promise z komunikatem potwierdzającym
 */
export const updateUserMatchPreferences = async (
  matchTypeIds: string[],
): Promise<{ message: string }> => {
  try {
    const response: AxiosResponse<{ message: string }> = await api.put(
      "api/match-preferences/user",
      { matchTypeIds },
    );
    return response.data;
  } catch (error) {
    handleApiError(error, "Błąd podczas aktualizacji preferencji dopasowań");
    throw error;
  }
};
