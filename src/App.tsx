import { useState, useEffect } from 'react';

import './reset.css';
import './App.css';

//localStorage.clear();

// const COLORS = ['#d53d45', '#3d7fd5', '#51cf66', '#b197fc', '#ffa94d'];

// 日記データの型定義

type DiaryEntry = {
  id: string;
  date: string;
  memberId: string;
  text: string;
};

const defaultMembers = [
  {
    id: 'member-1',
    name: 'わたし',
    color: '#ff6b6b',
  },
  {
    id: 'member-2',
    name: 'パパ',
    color: '#4da6ff',
  },
  {
    id: 'member-3',
    name: 'あかりん',
    color: '#51cf66',
  },
  {
    id: 'member-4',
    name: 'ゆうくん',
    color: '#b197fc',
  },
  {
    id: 'member-5',
    name: 'なっちゃん',
    color: '#ffa94d',
  },
];

//▼ App開始

function App() {
  const today = new Date();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  // ------------------------------

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  //「2026-10-07」という形式。初期値は今日
  const [selectedDate, setSelectedDate] = useState(
    `${todayYear}-${String(todayMonth + 1).padStart(2, '0')}-${String(todayDate).padStart(2, '0')}`,
  );

  const [selectedYear, selectedMonth, selectedDay] = selectedDate.split('-');
  //「2026年10月7日」形式にするためだけの変数（月・日付は0を省くため数値化）

  const [members, setMembers] = useState(defaultMembers);
  const [isMembersLoaded, setIsMembersLoaded] = useState(false);

  const [newMember, setNewMember] = useState('');

  //↓カラーの情報を持たせたかったのでオブジェクト化（ついでにidの情報も）
  const [selectedMember, setSelectedMember] = useState(members[0].id);
  const [inputText, setInputText] = useState('');

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isEntriesLoaded, setIsEntriesLoaded] = useState(false);

  // ------------------------------

  const displayDate = `${selectedYear}年${Number(selectedMonth)}月${Number(selectedDay)}日`;

  //現在月の最初の日の曜日
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  //現在月が何日まであるか取得
  const dayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  //末日が何曜日なのか取得
  const lastDay = new Date(currentYear, currentMonth + 1, 0).getDay();

  //★★ここからカレンダー生成処理！まずは空のcalendarCells配列生成
  const calendarCells = [];

  //初日の曜日をもとに空白セルを生成、calendarCellsにプッシュ
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push(<div className='noDay' key={`beforeNoDay-${i}`}></div>);
  }

  //その月の日数をもとに日付セルを生成、calendarCellsにプッシュ
  for (let i = 1; i <= dayOfMonth; i++) {
    //今日であるかの判定（←選べるようにしたいので今日と比べるのは卒業）
    // const isToday = currentYear===todayYear && currentMonth===todayMonth && i === todayDate;

    //日付ごとに「2026-10-07」形式の文字データを生成
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    //console.log(dateString);

    //それが現在選択中の日付と等しかったら…という条件
    const isSlected = dateString === selectedDate;

    const dateEntries = entries.filter((entry) => entry.date === dateString);

    const uniqueMemberIds = [...new Set(dateEntries.map((entry) => entry.memberId))];

    calendarCells.push(
      //isSlectedがtrueならselectedDateクラスも付ける
      <div
        className={`day ${isSlected ? 'selectedDate' : ''}`}
        key={`${currentYear}-${currentMonth}-${i}`}
        onClick={() => setSelectedDate(dateString)}
      >
        <span className='num'>{i}</span>
        <div className='dot-box'>
          {/*dayEntriesのid重複をなくしたuniqueMemberIds（戻り値はmember-1などのidが入った配列？）分だけ繰り返し点をつけたい*/}
          {/* member.id === entry.memberId でまたmembersから対象のメンバーを絞り込み、そのcolorをスタイルに当て込みたい*/}

          {uniqueMemberIds.map((id) => {
            const member = members.find((member) => member.id === id);

            return (
              <span className='dot' key={id} style={{ background: `${member ? member.color : '#cccccc'}` }}></span>
            );
          })}
        </div>
      </div>,
    );
  }

  //末日の曜日をもとに空白セルを生成、calendarCellsにプッシュ
  for (let i = 0; i < 6 - lastDay; i++) {
    calendarCells.push(<div className='noDay' key={`afterNoDay-${i}`}></div>);
  }

  //★表示月変更
  const changeMonth = (offset: number) => {
    const newDate = new Date(currentYear, currentMonth + offset);
    setCurrentYear(newDate.getFullYear());
    setCurrentMonth(newDate.getMonth());
    // console.log(selectedDate);
  };

  //初期読み込み時、ローカルストレージにentriesがあったら呼び出す
  useEffect(() => {
    const loadedEntries = localStorage.getItem('localEntries');
    if (loadedEntries) {
      setEntries(JSON.parse(loadedEntries));
    }
    setIsEntriesLoaded(true);

    //初期読み込み時、ローカルストレージにmembersがあったら呼び出す
    const loadedMembers = localStorage.getItem('localMembers');
    if (loadedMembers) {
      setMembers(JSON.parse(loadedMembers));
    }
    setIsMembersLoaded(true);
  }, []);

  //membersが更新された時、ローカルのmembersが読み込まれた時の対応を追加
  useEffect(() => {
    if (!isMembersLoaded) return;

    localStorage.setItem('localMembers', JSON.stringify(members));
  }, [members, isMembersLoaded]);

  //新規メンバー追加処理
  const handleAddMembers = () => {
    if (!newMember.trim()) {
      alert('追加メンバーの名前を入力してね！');
      return;
    }

    setMembers((prevMembers) => {
      return [
        ...prevMembers,
        {
          id: crypto.randomUUID(),
          name: newMember.trim(),
          color: '#cccccc',
        },
      ];
    });
    console.log('新規メンバー入りました！');
    setNewMember('');
  };

  //初期読み込み時＆entries更新時にローカルストレージに自動保存
  useEffect(() => {
    if (!isEntriesLoaded) return;

    localStorage.setItem('localEntries', JSON.stringify(entries));
  }, [entries, isEntriesLoaded]);

  //日記保存処理！
  const handleSave = () => {
    if (!selectedMember) {
      alert('メンバーを選択してね！');
      return;
    }
    if (!inputText.trim()) {
      alert('日記の内容を入れてね！');
      return;
    }

    setEntries([
      ...entries,
      {
        id: crypto.randomUUID(),
        date: selectedDate,
        memberId: selectedMember,
        text: inputText.trim(),
      },
    ]);
    console.log('保存するよ！');
    setInputText('');
  };

  //選択日の日記だけをdayEntriesに格納する
  const dayEntries = entries.filter((entry) => {
    return entry.date === selectedDate;
  });
  console.log(newMember);
  //console.log(dayEntries);

  return (
    <>
      <header>
        <h1>わたしのひとこと日記</h1>
      </header>
      <section className='writingBox'>
        <h2>{displayDate}に書く</h2>
        <select value={selectedMember} name='member' id='member' onChange={(e) => setSelectedMember(e.target.value)}>
          {members.map((member) => (
            <option value={member.id} key={member.id}>
              {member.name}
            </option>
          ))}
        </select>
        <textarea className='newDiary' value={inputText} onChange={(e) => setInputText(e.target.value)} />
        <button id='diarySaveBtn' onClick={handleSave}>
          保存
        </button>
      </section>

      <section className='members'>
        <details>
          <summary>
            <h2>メンバー管理</h2>
          </summary>
          <div className='membersList'>
            <ul>
              {members.map((member) => (
                <li key={member.id}>
                  <input type='text' value={member.name} />
                  <button>削除</button>
                </li>
              ))}
            </ul>
          </div>
          <div className='membersInput'>
            <input
              type='text'
              value={newMember}
              placeholder='新しい名前'
              onChange={(e) => setNewMember(e.target.value)}
            />
            <button onClick={handleAddMembers}>追加</button>
          </div>
        </details>
      </section>

      <section className='calendar'>
        <div className='calendarHead'>
          <button onClick={() => changeMonth(-1)}>◀</button>
          <h2>
            {currentYear}年{currentMonth + 1}月
          </h2>
          <button onClick={() => changeMonth(+1)}>▶</button>
        </div>

        <div className='calendarBody'>{calendarCells}</div>

        {/*<p>▲▲▲</p>

        <div className="calendarBody">
          <div className="noDay"></div>
          <div className="noDay"></div>
          <div className="day">
            <span className="num">1</span>
            <div className="dot-box">
              <span className="dot" style={{ background: "#ff6b6b" }}></span>
              <span className="dot" style={{ background: "#4da6ff" }}></span>
              <span className="dot" style={{ background: "#51cf66" }}></span>
              <span className="dot" style={{ background: "#b197fc" }}></span>
              <span className="dot" style={{ background: "#ffa94d" }}></span>
            </div>
          </div>
          <div className="day selectedDate">
            <span className="num">2</span>
            <div className="dot-box"></div>
          </div>
          <div className="day">
            <span className="num">3</span>
            <div className="dot-box"></div>
          </div>
          <div className="day">
            <span className="num">4</span>
            <div className="dot-box"></div>
          </div>
          <div className="day">
            <span className="num">5</span>
            <div className="dot-box"></div>
          </div>
          <div className="day">
            <span className="num">6</span>
            <div className="dot-box"></div>
          </div>
          <div className="day">
            <span className="num">7</span>
            <div className="dot-box"></div>
          </div>
          <div className="day">
            <span className="num">8</span>
            <div className="dot-box"></div>
          </div>
          <div className="day">
            <span className="num">9</span>
            <div className="dot-box"></div>
          </div>
          <div className="day">
            <span className="num">10</span>
            <div className="dot-box"></div>
          </div>
          <div className="day">
            <span className="num">11</span>
            <div className="dot-box"></div>
          </div>
          <div className="day">
            <span className="num">12</span>
            <div className="dot-box"></div>
          </div>
          <div className="day">
            <span className="num">13</span>
            <div className="dot-box"></div>
          </div>
          <div className="day">
            <span className="num">14</span>
            <div className="dot-box"></div>
          </div>
          <div className="day">
            <span className="num">15</span>
            <div className="dot-box"></div>
          </div>
          <div className="day">
            <span className="num">16</span>
            <div className="dot-box"></div>
          </div>
          <div className="day">
            <span className="num">17</span>
            <div className="dot-box"></div>
          </div>
          <div className="day">
            <span className="num">18</span>
            <div className="dot-box"></div>
          </div>
          <div className="day">
            <span className="num">19</span>
            <div className="dot-box"></div>
          </div>
          <div className="day">
            <span className="num">20</span>
            <div className="dot-box"></div>
          </div>
          <div className="day">
            <span className="num">21</span>
            <div className="dot-box"></div>
          </div>
          <div className="day">
            <span className="num">22</span>
            <div className="dot-box"></div>
          </div>
          <div className="day">
            <span className="num">23</span>
            <div className="dot-box"></div>
          </div>
          <div className="day">
            <span className="num">24</span>
            <div className="dot-box"></div>
          </div>
          <div className="day">
            <span className="num">25</span>
            <div className="dot-box"></div>
          </div>
          <div className="day">
            <span className="num">26</span>
            <div className="dot-box"></div>
          </div>
          <div className="day">
            <span className="num">27</span>
            <div className="dot-box"></div>
          </div>
          <div className="day">
            <span className="num">28</span>
            <div className="dot-box"></div>
          </div>
          <div className="day">
            <span className="num">29</span>
            <div className="dot-box"></div>
          </div>
          <div className="day">
            <span className="num">30</span>
            <div className="dot-box"></div>
          </div>
          <div className="noDay"></div>
          <div className="noDay"></div>
          <div className="noDay"></div>
        </div>*/}
      </section>

      <section className='showDiary'>
        <h2>{displayDate}の日記</h2>

        <div className='diaryFilter'>
          <p>表示フィルター</p>
          <select name='filter' id='filter'>
            <option value='わたし'>わたし</option>
            <option value='パパ'>パパ</option>
            <option value='あかりん'>あかりん</option>
            <option value='ゆうくん'>ゆうくん</option>
            <option value='なっちゃん'>なっちゃん</option>
          </select>
        </div>

        <div className='diary'>
          {dayEntries.length === 0 ? (
            <p>（この日の日記はまだありません）</p>
          ) : (
            dayEntries.map((entry) => {
              const member = members.find((member) => member.id === entry.memberId);

              return (
                <div
                  className='myDiary'
                  key={`diary-${entry.id}`}
                  style={{
                    borderLeft: `5px solid ${member ? member.color : '#cccccc'}`,
                  }}
                >
                  <h3>{member ? member.name : '不明なメンバー'}</h3>
                  <p>{entry.text}</p>
                </div>
              );
            })
          )}
          {/*<p>▲▲▲</p>
          <div className="myDiary" style={{borderLeft: "#d53d45 solid 5px"}}>
            <h3>わたし</h3>
            <p>
              ここにこうやって日記を書くんだよ！ここにこうやって日記を書くんだよ！！
            </p>
          </div>
          <div className="myDiary" style={{borderLeft: "#3d7fd5 solid 5px"}}>
            <h3>パパ</h3>
            <p>今日も家ではゆっくりしてたのう〜</p>
          </div>*/}
        </div>
      </section>
    </>
  );
}
//▲▲ Appコンポーネントおわり

export default App;
