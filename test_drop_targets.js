// Simulating the dropTargets array from the drag and drop operation
// This is what would be logged from: console.log('xxxxxxxx....', data.location.current.dropTargets)

// Sample dropTargets array structure based on Atlaskit drag and drop
const dropTargets = [
  {
    data: {
      type: "card",
      cardId: "task-123",
      instanceId: "board-1"
    },
    element: {
      getBoundingClientRect: () => ({
        top: 100,
        left: 200,
        width: 300,
        height: 150
      })
    },
    rect: {
      top: 100,
      left: 200,
      width: 300,
      height: 150
    }
  },
  {
    data: {
      type: "column",
      columnId: "column-1",
      instanceId: "board-1"
    },
    element: {
      getBoundingClientRect: () => ({
        top: 0,
        left: 0,
        width: 400,
        height: 600
      })
    },
    rect: {
      top: 0,
      left: 0,
      width: 400,
      height: 600
    }
  }
];

// Running the last array (dropTargets)
console.log("=== Running the last array (dropTargets) ===");
console.log("Array length:", dropTargets.length);
console.log("Array contents:", JSON.stringify(dropTargets, null, 2));

// Accessing specific properties
console.log("\n=== Accessing specific properties ===");
dropTargets.forEach((target, index) => {
  console.log(`Target ${index + 1}:`);
  console.log(`  Type: ${target.data.type}`);
  console.log(`  ID: ${target.data.cardId || target.data.columnId}`);
  console.log(`  Instance ID: ${target.data.instanceId}`);
  console.log(`  Position: (${target.rect.left}, ${target.rect.top})`);
  console.log(`  Size: ${target.rect.width}x${target.rect.height}`);
});

// Example of how you might use this in the actual code
console.log("\n=== Example usage in actual code ===");
const lastDropTarget = dropTargets[dropTargets.length - 1];
console.log("Last drop target:", lastDropTarget?.data);

// Filtering drop targets by type
const cardTargets = dropTargets.filter(target => target.data.type === "card");
const columnTargets = dropTargets.filter(target => target.data.type === "column");

console.log("\n=== Filtered results ===");
console.log("Card targets:", cardTargets.length);
console.log("Column targets:", columnTargets.length); 