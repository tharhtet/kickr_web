import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { countriesApi } from './api';
import type { Country, CreateCountryInput, UpdateCountryInput } from './types';

export const countriesKeys = {
  all: ['countries'] as const,
};

/** `GET /countries` */
export function useCountries() {
  return useQuery({
    queryKey: countriesKeys.all,
    queryFn: ({ signal }) => countriesApi.list(signal),
  });
}

/** `POST /countries` — appends the new country, then refetches. */
export function useCreateCountry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCountryInput) => countriesApi.create(input),
    onSuccess: (country) => {
      qc.setQueryData<Country[]>(countriesKeys.all, (prev = []) => [
        ...prev.filter((c) => c.id !== country.id),
        country,
      ]);
      qc.invalidateQueries({ queryKey: countriesKeys.all, exact: true });
    },
  });
}

/**
 * `PATCH /countries/:id` — patches the row matched by the requested `id`
 * (not the response's) so a changed id can't duplicate it, then refetches.
 */
export function useUpdateCountry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCountryInput }) =>
      countriesApi.update(id, input),
    onSuccess: (country, { id }) => {
      qc.setQueryData<Country[]>(countriesKeys.all, (prev = []) =>
        prev.map((c) => (c.id === id ? country : c)),
      );
      qc.invalidateQueries({ queryKey: countriesKeys.all, exact: true });
    },
  });
}

/** `DELETE /countries/:id` */
export function useDeleteCountry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => countriesApi.remove(id),
    onSuccess: (_res, id) => {
      qc.setQueryData<Country[]>(countriesKeys.all, (prev = []) =>
        prev.filter((c) => c.id !== id),
      );
    },
  });
}
