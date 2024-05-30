import { v4 as uuidv4 } from "https://jspm.dev/uuid";
import { detecIcon, detecType, setStorage } from "./helpers.js"; //* sonuna js vermeyi unutma yoksa hata verir.

//! Html'den gelenler
const form = document.querySelector("form");
const list = document.querySelector("ul");

//! Olay İzleyicileri
form.addEventListener("submit", handleSubmit);
list.addEventListener("click", handleClick);

//! Ortak Kullanım Alanı(Global)
var map;
var layerGroup = [];
var coords = [];
var notes = JSON.parse(localStorage.getItem("notes")) || []; //* Local storage da veri varsa gelmesini yoksa boş bir dizi gelmesini söyledik.

/*
 * Kullanıcının konumnu öğrenmek için getCurrentPosition methodunu kullandık ve bizden iki parametre istedi:
 * 1. Kullanıcı konum izni vermediğinde çalışacak fonksiyondur.
 * 2. Kullanıcı konum izni verdiğinde çalışacak fonksiyondur.
 */

navigator.geolocation.getCurrentPosition(loadMap, errorFunction);
function errorFunction() {
  ("hata");
}


//* Haritaya tıklanınca çalışır.
function onMapClick(e) {
  //* Haritaya tıklandığında form bileşenin display özelliğini flex yaptık.yani tıklandığında not ekle kısmının ekrana gelmesini sağladık.
  form.style.display = "flex";

  //* Haritada tıkladığımız yerin koordinatlarını coords dizisi içerisine aktardık.
  coords = [e.latlng.lat, e.latlng.lng];
  coords;
 
}


//* Kullanıcının konumuna göre haritayı ekrana aktarır.
function loadMap(e) {

  // * 1.Haritanın Kurulumu. Leafletten aldık
  map = L.map("map").setView([e.coords.latitude, e.coords.longitude], 10); //* soldaki 10 değeri zoom oranı
  L.control; 
  //* 2.Haritanın nasıl görüneceğini belirliyor.Leafletten aldık
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  //* 3. Harita da ekrana basılacak imleçleri tutacağımız katman
  layerGroup = L.layerGroup().addTo(map);

  //* Localden gelen notesları(dataları) listeleme
  renderNoteList(notes);

  //* Haritada bir tıklanma olduğunda çalışacak fonksiyon
  map.on("click", onMapClick);
}

function renderMarker(item) {


  // Markerı oluşturur
  L.marker(item.coords, { icon: detecIcon(item.status)})
  .addTo(layerGroup). //* imleçlerin olduğu katmana eklendi
  bindPopup(`${item.desc}`); //* üzerine tıklanınca açılacak pop up ekleme
}

function handleSubmit(e) {
  e.preventDefault(e); //* SAyfanın yenilenmesini engeller.

  const desc = e.target[0].value; //* Formun içerisindeki inputun değerini alma
  const date = e.target[1].value; //* Formun içerisindeki date inputunun değerini alma
  const status = e.target[2].value; //* Formun içerisindeki select yapınısın değerini alma


  notes.push({
    id: uuidv4(),
    desc,
    date,
    status,
    coords,
  });

  //! Local Storage Güncelle
  setStorage(notes);

  //* renderNoteList fonksiyonuna parametre olarak notes dizisini gönderdirdik.
  renderNoteList(notes);

  //* Form gönderildiğinde kapat
  form.style.display = "none"; //* Notlara ekleme yaıldıktan sonra form alanının kapatıyor.
}



//! Ekrana notları aktaracak fonksiyon
function renderNoteList(item) {


  //* Notlar( list) alanını temizler.
  list.innerHTML = ""; //* içerisinde veri varsa temizle. boş bir stringe çek yani.

  //* Markerları temizler
  layerGroup.clearLayers()

  //* Herbir not için li etiketi oluşturur ve içerisini günceller. her bir item için ekrana bir not bileşeni bastıracağız.

  item.forEach((item) => {
    const listElement = document.createElement("li"); //* bir li etiketi oluşturur.
    listElement.dataset.id = item.id; //* li etiketine data-id özelliği ekleme
    listElement; 

    //? içerisini dinamik (canlı) yaptık.Literal template (backtick) yapısı ile
    listElement.innerHTML = `
        <div>
            <p>${item.desc}</p>
            <p><span>Tarih:</span>${item.date}</p>
            <p><span>Durum:</span>${detecType(item.status)}</p>
        </div>
        <i class="bi bi-x" id="delete"></i>
        <i class="bi bi-airplane-fill" id="fly"></i>
        `;

     /*  list.appendChild(listElement) */ //?yandaki komut listeni sonuna ekleme yapar

     //? Aşağıdaki komut listenin başına ekleme yapar.
     list.insertAdjacentElement("afterbegin", listElement); //* listenin başına ekleme yapar

     //* Ekrana Marker işaretleyici basma
     renderMarker(item);
  });
}

//* Notes alanında tıklanma olayını izler
function handleClick(e) {
  //* Güncellenecek elemanın id'sini öğrenmek için parentElement yöntemini kullanıdık.
  const id = e.target.parentElement.dataset.id;
  console.log(id);
  if (e.target.id === "delete") {
    //* idsini bildiğimiz elemanı diziden filter yöntemi kullanarak kaldırdık
    notes = notes.filter((note) => note.id != id);
    console.log(notes);
    setStorage(notes); //* localStorage güncelle
    renderNoteList(notes); //* ekranı güncelle
  }

  if (e.target.id === "fly") {
    //* Tıkladığımız elemanın idsi ile dizi içerindeki elemanlardan herhangi birinin idsi eşleşirse bul.
    const note = notes.find((note) => note.id == id);
    console.log(note);
    map.flyTo(note.coords)  ///* Haritayı bulduğumuz elemana yönlendirmesi için flyTo methodunu kullandık.
  }
}

