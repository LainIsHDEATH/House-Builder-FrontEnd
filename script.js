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

document.getElementById("calculateArea").addEventListener("click", () => {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  canvas.getObjects().forEach((obj) => {
    if (obj.fill === "gray") {
      // Проверяем только стены
      const { left, top, width, height } = obj;
      minX = Math.min(minX, left);
      minY = Math.min(minY, top);
      maxX = Math.max(maxX, left + width);
      maxY = Math.max(maxY, top + height);
    }
  });

  if (minX === Infinity || minY === Infinity) {
    document.getElementById("roomArea").innerText = "Комната не найдена!";
    return;
  }

  const roomWidth = maxX - minX;
  const roomHeight = maxY - minY;
  const area = (roomWidth * roomHeight) / (100 * 100); // Конвертируем в м² (если 1px = 1см)

  document.getElementById(
    "roomArea"
  ).innerText = `Площадь комнаты: ${area.toFixed(2)} м²`;
});

let isDrawing = false;
let points = [];
let tempLine = null;
let roomPolygon = null;

document.getElementById("drawRoom").addEventListener("click", () => {
  if (roomPolygon) {
    canvas.remove(roomPolygon);
    roomPolygon = null;
  }

  isDrawing = true;
  points = [];

  // Начинаем рисование
  canvas.on("mouse:down", (event) => {
    if (!isDrawing) return;

    const { x, y } = event.pointer;
    points.push({ x, y });

    if (points.length > 1) {
      if (tempLine) canvas.remove(tempLine);

      tempLine = new fabric.Line(
        [points[points.length - 2].x, points[points.length - 2].y, x, y],
        {
          stroke: "blue",
          strokeWidth: 2,
          selectable: false,
          evented: false,
        }
      );
      canvas.add(tempLine);
    }

    // Замыкаем контур
    if (
      points.length > 2 &&
      Math.abs(points[0].x - x) < 10 &&
      Math.abs(points[0].y - y) < 10
    ) {
      isDrawing = false;
      canvas.off("mouse:down");

      roomPolygon = new fabric.Polygon(points, {
        fill: "rgba(0, 0, 255, 0.1)", // Прозрачный фон, чтобы сетка была видна
        stroke: "blue",
        strokeWidth: 2,
        selectable: true,
      });

      canvas.add(roomPolygon);
      canvas.renderAll(); // Принудительный ререндер
    }
  });
});

document
  .getElementById("calculatePolygonArea")
  .addEventListener("click", () => {
    if (!roomPolygon) {
      document.getElementById("polygonArea").innerText = "Контур не нарисован!";
      return;
    }

    const points = roomPolygon.points;
    let area = 0;

    for (let i = 0; i < points.length; i++) {
      let j = (i + 1) % points.length;
      area += points[i].x * points[j].y - points[j].x * points[i].y;
    }
    area = Math.abs(area) / 2 / (100 * 100); // Конвертация в м² (если 1px = 1см)

    document.getElementById(
      "polygonArea"
    ).innerText = `Площадь по контуру: ${area.toFixed(2)} м²`;
  });
