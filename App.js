import React from "react";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TextInput,
  Dimensions,
  Platform,
  ScrollView,
  AsyncStorage
} from "react-native";
import { AppLoading } from "expo";
import ToDo from "./ToDo";
import uuidv1 from "uuid/v1";

const { height, width } = Dimensions.get("window");

export default class App extends React.Component {
  state = {
    newTODO: "",
    loadedToDos: false,
    toDos: {}
  };

  componentDidMount = () => {
    this._loadToDos();
  };

  render() {
    const { newTODO, loadedToDos, toDos } = this.state;
    console.log(toDos);
    if (!loadedToDos) {
      return <AppLoading />;
    }
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <Text style={styles.title}>Kawai TO DO</Text>
        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder={"New TO DO"}
            value={newTODO}
            onChangeText={this._controlNewTODO}
            placeholderTextColor={"#999"}
            returnKeyType={"done"}
            autoCorrect={false}
            onSubmitEditing={this._addToDo}
            //onSubmitEditing : 완료를 누를 때
          ></TextInput>
          <ScrollView contentContainerStyle={styles.toDos}>
            {Object.values(toDos)
              .reverse()
              .map(toDo => (
                <ToDo
                  key={toDo.id}
                  {...toDo}
                  deleteToDo={this._deleteToDo}
                  completeToDo={this._completeToDo}
                  uncompleteToDo={this._uncompleteToDo}
                  updateToDo={this._updateToDo}
                />
              ))}
          </ScrollView>
        </View>
      </View>
    );
  }
  _controlNewTODO = text => {
    this.setState({
      newTODO: text
    });
  };

  // 적은 To do를 로딩
  // 로딩을 하는 fucntion :  async function , 로딩이 끝날때 까지 기다려야한다는 뜻
  _loadToDos = async () => {
    try {
      const toDos = await AsyncStorage.getItem("toDos");
      //AsyncStorage란? 작은 variable(key value object)를 우리 폰의 disk에 저장
      //setItem, getItem, clearItem, clearAll ,getAll 등이 있음
      //getItem을 통해서 처리된 string을받음

      //우리는 object를 사용하므로 object로 다시 변경해 줘야함.(디스크에 저장할 때만 string)
      const parsedToDos = JSON.parse(toDos);
      console.log(toDos);
      this.setState({ loadedToDos: true, toDos: parsedToDos || {} }); // todo가 다 삭제시 앱시작할 때 문제가 생기므로 {} = null 을 만들어줌
    } catch (err) {
      console.log(err);
    }
  };

  // to do를 state에서 가져옴
  _addToDo = () => {
    const { newTODO } = this.state; // newTODO 는 Value 값이다
    if (newTODO !== " ") {
      // 만일 공백이 아닐 경우
      this.setState(prevState => {
        const ID = uuidv1(); // 임의로 id를 만들어주는 uuid라는 npm 모듈 같음
        const newToDoObject = {
          [ID]: {
            id: ID,
            isCompleted: false,
            text: newTODO,
            createAt: Date.now()
          }
        };
        const newState = {
          ...prevState,
          newTODO: "", // 입력 후 Value값을 없애 준다
          toDos: {
            // 오브젝트
            ...prevState.toDos,
            ...newToDoObject
            // id : { text : "new todo"} 같은 결과가 나옴
          }
        };
        this._saveToDos(newState.toDos);
        return { ...newState };
      });
    }
  };
  _deleteToDo = id => {
    this.setState(prevState => {
      const toDos = prevState.toDos;
      delete toDos[id];
      const newState = {
        ...prevState,
        ...toDos
      };
      this._saveToDos(newState.toDos);
      return { ...newState };
    });
  };

  // 할 일 목록을 완성, 미완성하는 작업
  // 컨트롤러
  _uncompleteToDo = id => {
    // 미완성
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: {
            ...prevState.toDos[id],
            // [id] : { text : '' , creatAt : '' , ... } 을 의미
            isCompleted: false
          }
        }
      };
      this._saveToDos(newState.toDos);
      return { ...newState }; // 이전 것들을 주고 + todo
    });
  };
  _completeToDo = id => {
    // 완성
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          ...prevState.toDos,
          [id]: {
            ...prevState.toDos[id],
            isCompleted: true
          }
        }
      };
      this._saveToDos(newState.toDos);
      return { ...newState }; // 이전 것들을 주고 + todo
    });
  };

  // 텍스트를 업데이트
  _updateToDo = (id, text) => {
    this.setState(prevState => {
      const newState = {
        ...prevState,
        toDos: {
          //우리가 찾는 id의 todo를 찾고
          ...prevState.toDos,
          [id]: {
            ...prevState.toDos[id],
            text: text
          }
        }
      };
      this._saveToDos(newState.toDos);
      return { ...newState }; // 해당 투두의 의전에 내용에 덮어쓰고 싶은 내용을 추가
    });
  };

  _saveToDos = newToDos => {
    // console.log(newToDos);
    // const saveToDos = AsyncStorage.setItem("toDos", newToDos);
    //setItem("key" , value)
    //AsyncStorage는 string 저장용이기 때문에 우리가 가진 object는 저장이 안된다. -> 우리 object를 string으로 변경시켜야함
    console.log(JSON.stringify(newToDos));
    // JSON.stringify(object) :  오브젝트를 string으로 변경시켜줌
    const saveToDos = AsyncStorage.setItem("toDos", JSON.stringify(newToDos));
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f23657",
    alignItems: "center"
  },
  title: {
    color: "white",
    fontSize: 30,
    marginTop: 80,
    fontWeight: "200",
    marginBottom: 30
  },
  card: {
    backgroundColor: "white",
    flex: 1,
    width: width - 25,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    ...Platform.select({
      ios: {
        shadowColor: "rgb(50,50,50)",
        shadowOpacity: 0.5,
        shadowRadius: 5,
        shadowOffset: {
          height: -1,
          width: 0
        }
      },
      android: {
        elevation: 3
      }
    })
  },
  input: {
    padding: 20,
    borderBottomColor: "#bbb",
    borderBottomWidth: 1,
    fontSize: 25
  },
  toDos: {
    alignItems: "center"
  }
});
