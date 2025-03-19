document.addEventListener("DOMContentLoaded", () => {
  const canvas = new fabric.Canvas("canvas", {
    width: 800,
    height: 600,
    backgroundColor: "#ffffff",
  });

  // Функция для добавления стены
  document.getElementById("addWall").addEventListener("click", () => {
    const wall = new fabric.Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 10,
      fill: "gray",
      selectable: true,
    });
    canvas.add(wall);
  });

  // Функция для добавления окна
  document.getElementById("addWindow").addEventListener("click", () => {
    const window = new fabric.Rect({
      left: 150,
      top: 120,
      width: 60,
      height: 40,
      fill: "lightblue",
      selectable: true,
    });
    canvas.add(window);
  });

  // Функция для добавления двери
  document.getElementById("addDoor").addEventListener("click", () => {
    const door = new fabric.Rect({
      left: 250,
      top: 90,
      width: 40,
      height: 70,
      fill: "brown",
      selectable: true,
    });
    canvas.add(door);
  });

  // Функция для добавления обогревателя
  document.getElementById("addHeater").addEventListener("click", () => {
    const heater = new fabric.Circle({
      left: 200,
      top: 200,
      radius: 15,
      fill: "red",
      selectable: true,
    });
    canvas.add(heater);
  });

  // Функция для сохранения модели
  document.getElementById("saveHouse").addEventListener("click", () => {
    const json = canvas.toJSON();
    console.log("House Model:", json);

    fetch("/api/houses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: json }),
    })
      .then((response) => response.json())
      .then((data) => console.log("Сохранено:", data))
      .catch((error) => console.error("Ошибка:", error));
  });
});
