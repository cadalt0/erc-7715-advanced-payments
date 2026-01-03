import assert from "assert";
import { 
  TestHelpers,
  Circle_E1
} from "generated";
const { MockDb, Circle } = TestHelpers;

describe("Circle contract E1 event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for Circle contract E1 event
  const event = Circle.E1.createMockEvent({/* It mocks event fields with default values. You can overwrite them if you need */});

  it("Circle_E1 is created correctly", async () => {
    // Processing the event
    const mockDbUpdated = await Circle.E1.processEvent({
      event,
      mockDb,
    });

    // Getting the actual entity from the mock database
    let actualCircleE1 = mockDbUpdated.entities.Circle_E1.get(
      `${event.chainId}_${event.block.number}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedCircleE1: Circle_E1 = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      a: event.params.a,
      b: event.params.b,
      c: event.params.c,
      d: event.params.d,
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualCircleE1, expectedCircleE1, "Actual CircleE1 should be the same as the expectedCircleE1");
  });
});
