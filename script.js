document.addEventListener("DOMContentLoaded", () => {
  const canvas = new fabric.Canvas("canvas", {
    width: 800,
    height: 600,
    backgroundColor: "#ffffff",
  });

  // ✅ Функция для создания сетки
  function drawGrid(gridSize = 50) {
    for (let i = 0; i < canvas.width; i += gridSize) {
      canvas.add(
        new fabric.Line([i, 0, i, canvas.height], {
          stroke: "#ddd",
          selectable: false,
        })
      );
    }
    for (let j = 0; j < canvas.height; j += gridSize) {
      canvas.add(
        new fabric.Line([0, j, canvas.width, j], {
          stroke: "#ddd",
          selectable: false,
        })
      );
    }
  }

  drawGrid();

  // ✅ Добавление стены
  document.getElementById("addWall").addEventListener("click", () => {
    const wall = new fabric.Rect({
      left: 100,
      top: 100,
      width: 200,
      height: 10,
      fill: "gray",
      hasControls: true,
      selectable: true,
    });
    canvas.add(wall);
  });

  // ✅ Добавление окна
  document.getElementById("addWindow").addEventListener("click", () => {
    const window = new fabric.Rect({
      left: 150,
      top: 120,
      width: 60,
      height: 40,
      fill: "lightblue",
      hasControls: true,
      selectable: true,
    });
    canvas.add(window);
  });

  // ✅ Добавление двери
  document.getElementById("addDoor").addEventListener("click", () => {
    const door = new fabric.Rect({
      left: 250,
      top: 90,
      width: 40,
      height: 70,
      fill: "brown",
      hasControls: true,
      selectable: true,
    });
    canvas.add(door);
  });

  // ✅ Добавление обогревателя
  document.getElementById("addHeater").addEventListener("click", () => {
    const heater = new fabric.Circle({
      left: 200,
      top: 200,
      radius: 15,
      fill: "red",
      hasControls: true,
      selectable: true,
    });
    canvas.add(heater);
  });

  // ✅ Удаление выбранного объекта
  document.getElementById("deleteObject").addEventListener("click", () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
    }
  });

  // ✅ Отображение свойств объекта
  canvas.on("selection:created", (event) => {
    const obj = event.selected[0];
    document.getElementById("widthInput").value = obj.width * obj.scaleX;
    document.getElementById("heightInput").value = obj.height * obj.scaleY;
    document.getElementById("colorInput").value = obj.fill;
  });

  // ✅ Обновление свойств объекта
  function updateSelectedObject() {
    const obj = canvas.getActiveObject();
    if (obj) {
      obj.set({
        width: parseFloat(document.getElementById("widthInput").value),
        height: parseFloat(document.getElementById("heightInput").value),
        fill: document.getElementById("colorInput").value,
      });
      canvas.renderAll();
    }
  }

  document
    .getElementById("widthInput")
    .addEventListener("input", updateSelectedObject);
  document
    .getElementById("heightInput")
    .addEventListener("input", updateSelectedObject);
  document
    .getElementById("colorInput")
    .addEventListener("input", updateSelectedObject);

  // ✅ Сохранение модели
  document.getElementById("saveHouse").addEventListener("click", () => {
    const json = canvas.toJSON();
    console.log("House Model:", json);

    fetch("/api/houses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: json }),
    });
  });

  // ✅ Загрузка модели
  document.getElementById("loadHouse").addEventListener("click", () => {
    fetch("/api/houses/last") // Загружает последнюю сохранённую модель
      .then((response) => response.json())
      .then((data) => {
        canvas.loadFromJSON(data.model, () => {
          canvas.renderAll();
        });
      });
  });
});
