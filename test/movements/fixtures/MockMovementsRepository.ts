import { Movement } from "../../../src/movements/domain/Movement";
import { MovementsRepository } from "../../../src/movements/domain/MovementsRepository";
import { movementMockList } from "./movementMockList";

export const MockMovementsRepository: () => MovementsRepository = () => {
  let movementList = [...movementMockList];

  return {
    getAll: async (): Promise<Movement[]> => {
      return movementList;
    },

    query: async (props: {
      page: number;
      limit: number;
    }): Promise<{ movementList: Movement[]; pages: number }> => {
      return { movementList, pages: 1 };
    },

    persist: async (movement): Promise<void> => {
      movementList = [...movementList, movement];
    },
    findOne: async ({ id, userId }): Promise<Movement | undefined> => {
      return movementList.find((movement) => movement.id === id);
    },
    update: async (movement): Promise<void> => {
      const index = movementList.findIndex(
        (movement) => movement.id === movement.id
      );

      if (index === -1) return;

      movementList[index] = movement;
    },
    delete: async (id): Promise<void> => {
      movementList = movementList.filter((movement) => movement.id !== id);
    },
  };
};
