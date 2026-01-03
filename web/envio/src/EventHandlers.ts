/*
 * Please refer to https://docs.envio.dev for a thorough guide on all Envio indexer features
 */
import {
  Circle,
  Circle_E1,
} from "generated";

Circle.E1.handler(async ({ event, context }) => {
  const entity: Circle_E1 = {
    id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
    a: event.params.a,
    b: event.params.b,
    c: event.params.c,
    d: event.params.d,
  };

  context.Circle_E1.set(entity);
});
