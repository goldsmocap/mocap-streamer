import { ref, Ref } from "@vue/composition-api";

type Vec2 = [number, number];

export interface Entity {}

export const entities: Ref<Entity[]> = ref([]);
export const clicked: Ref<Entity | undefined> = ref(undefined);
export const dblClicked: Ref<Entity | undefined> = ref(undefined);
export const mouseOver: Ref<Entity | undefined> = ref(undefined);
export const mousePos: Ref<Vec2> = ref([0, 0] as Vec2);
