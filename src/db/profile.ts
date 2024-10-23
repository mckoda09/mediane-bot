import { kv } from "../mod.ts";

interface Register {
  firstName: string;
  lastName: string;
  isFree: boolean;
}

const registerKey = (id: number) => ["register", id];

export const getRegister = async (id: number) =>
  (await kv.get<Register>(registerKey(id))).value;

export const setRegister = async (id: number, register: Register) =>
  await kv.set(registerKey(id), register);

export const deleteRegister = async (id: number) =>
  await kv.delete(registerKey(id));

const tmpFirstNameKey = (id: number) => ["tmpFirstName", id];
const tmpLastNameKey = (id: number) => ["tmpLastName", id];
const tmpIsFreeKey = (id: number) => ["tmpIsFree", id];

export const setTmpFirstName = async (id: number, firstName: string) =>
  await kv.set(tmpFirstNameKey(id), firstName);
export const setTmpLastName = async (id: number, lastName: string) =>
  await kv.set(tmpLastNameKey(id), lastName);
export const setTmpIsFree = async (id: number, isFree: boolean) =>
  await kv.set(tmpIsFreeKey(id), isFree);

export const getTmpFirstName = async (id: number) =>
  (await kv.get<string>(tmpFirstNameKey(id))).value;
export const getTmpLastName = async (id: number) =>
  (await kv.get<string>(tmpLastNameKey(id))).value;
export const getTmpIsFree = async (id: number) =>
  (await kv.get<boolean>(tmpIsFreeKey(id))).value;

export const clearTmp = async (id: number) => {
  await kv.atomic()
    .delete(tmpFirstNameKey(id))
    .delete(tmpLastNameKey(id))
    .delete(tmpIsFreeKey(id))
    .commit();
};

interface Profile {
  firstName: string;
  lastName: string;
  isFree: boolean;
}

const profileKey = (id: number) => ["profile", id];

export const setProfile = async (id: number, profile: Profile) =>
  await kv.set(profileKey(id), profile);

export const getProfile = async (id: number) =>
  (await kv.get<Profile>(profileKey(id))).value;
