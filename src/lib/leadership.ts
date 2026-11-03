// Music directors and leadership of YMJ BSD Community Orchestra.
// Biodata sourced from official YMJ & STIKMI websites.
// Photos can be placed in public/uploads/leadership/ folder.

export interface Leader {
  name: string
  role: string
  roleEn: string
  roleZh: string
  bio: string
  bioEn: string
  photoUrl: string
}

export const FOUNDER: Leader = {
  name: "Dr. Kuei Pin Yeo",
  role: "Pendiri & Music Director",
  roleEn: "Founder & Music Director",
  roleZh: "创始人兼音乐总监",
  bio: "Dr. Kuei Pin Yeo adalah pianis Indonesia pertama yang meraih gelar Doctor of Music dalam piano performance. Beliau mendirikan Yayasan Musik Jakarta pada tahun 1983 setelah kembali dari studinya di Amerika Serikat. Sebagai grantee John D. Rockefeller 3rd Fund/Asian Cultural Council dan Helena Rubinstein Foundation, beliau juga menerima prestisius Harold Bauer Award. Debutnya di Carnegie Recital Hall New York tahun 1978 dipuji oleh The New York Times sebagai 'both polished technician and responsive musician'. Beliau telah berkonser secara ekstensif di Amerika dan Asia Timur, dan kerap diundang untuk memberikan master class serta lecture recitals.",
  bioEn: "Dr. Kuei Pin Yeo is Indonesia's first Doctor of Music in piano performance. She founded Yayasan Musik Jakarta in 1983 upon returning from her studies in the United States. As a grantee of the John D. Rockefeller 3rd Fund/Asian Cultural Council and Helena Rubinstein Foundation, she also received the prestigious Harold Bauer Award. Her Carnegie Recital Hall debut in 1978 was hailed by The New York Times as 'both polished technician and responsive musician.' She has concertized extensively in America and the Far East, and is frequently invited to conduct master classes and lecture recitals.",
  photoUrl: "/uploads/leadership/kuei-pin-yeo.jpg",
}

export const FOUNDER_MESSAGE = {
  id: "Selamat datang di YMJ BSD Community Orchestra. Visi kami adalah terus meningkatkan kualitas kehidupan manusia melalui pendidikan dan pertunjukan musik. Melalui orkes komunitas ini, kami ingin memberikan ruang bagi setiap orang — dari anak-anak hingga dewasa — untuk bertumbuh, berlatih, dan tampil bersama. Mari wujudkan konser perdana kita di Februari 2027.",
  en: "Welcome to YMJ BSD Community Orchestra. Our vision is to continue to enhance the quality of human life through music education and performance. Through this community orchestra, we want to provide a space for everyone — from children to adults — to grow, rehearse, and perform together. Let us bring our inaugural concert to life in February 2027.",
}

export const FOUNDER_QUOTE = {
  id: "Musik menyatukan orang dari berbagai latar belakang — dalam harmoni, kita menemukan kebersamaan.",
  en: "Music brings people together — in harmony, we find unity.",
}

export const MUSIC_DIRECTORS: Leader[] = [
  {
    name: "Dr. Kuei Pin Yeo",
    role: "Music Director",
    roleEn: "Music Director",
    roleZh: "音乐总监",
    bio: "Pendiri Yayasan Musik Jakarta (1983). Indonesia's first Doctor of Music in piano performance. Grantee John D. Rockefeller 3rd Fund/Asian Cultural Council & Helena Rubinstein Foundation. Penerima Harold Bauer Award. Debut Carnegie Recital Hall 1978. Memimpin visi artistik dan pengembangan orkes komunitas BSD.",
    bioEn: "Founder of Yayasan Musik Jakarta (1983). Indonesia's first Doctor of Music in piano performance. Grantee of John D. Rockefeller 3rd Fund/Asian Cultural Council & Helena Rubinstein Foundation. Recipient of the Harold Bauer Award. Carnegie Recital Hall debut 1978. Leads the artistic vision and development of the BSD community orchestra.",
    photoUrl: "/uploads/leadership/kuei-pin-yeo.jpg",
  },
  {
    name: "Jap Tji Kien",
    role: "Resident Konduktor",
    roleEn: "Resident Conductor",
    roleZh: "常驻指挥",
    bio: "Lahir di Bandung, Indonesia. Mulai belajar violin pada usia 4 tahun. Sejak debut di usia 10 tahun, karirnya sebagai solois dan chamber musician telah membawanya ke berbagai panggung konser, penampilan radio dan televisi, serta mendapat pengakuan luas di seluruh Indonesia. Penerima pertama FRSM (Fellowship Royal School of Music, London). Head of Strings di STIKMI. Bertanggung jawab atas latihan rutin dan persiapan konser orkes komunitas BSD.",
    bioEn: "Born in Bandung, Indonesia. Began his violin studies at the age of 4. Since his debut appearance at the age of 10, his career as a soloist and chamber musician has taken him to various concert stages, radio and television appearances, and he has gained wide recognition throughout the country. First FRSM (Fellowship Royal School of Music, London) award recipient. Head of Strings at STIKMI. Responsible for routine rehearsals and concert preparation of the BSD community orchestra.",
    photoUrl: "/uploads/leadership/jap-tji-kien.jpg",
  },
  {
    name: "Unung",
    role: "Konduktor",
    roleEn: "Conductor",
    roleZh: "指挥",
    bio: "Konduktor orkes yang membimbing member dalam interpretasi repertoar dan pengembangan musikalitas. Berperan penting dalam persiapan penampilan orkes komunitas BSD menuju konser perdana Februari 2027.",
    bioEn: "Orchestra conductor who guides members in repertoire interpretation and musicality development. Plays a key role in preparing the BSD community orchestra's performances toward the inaugural concert in February 2027.",
    photoUrl: "/uploads/leadership/unung.jpg",
  },
]
