import React from 'react';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Button } from 'react-native-elements';
import { StyleSheet, Text, View, Dimensions, TouchableHighlight, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SERVER from '../config';
import TypeIcon from './TypeIcon';

let typeCount = SERVER.typeCount;
let buttonNames = SERVER.buttonNames;
let iconNames = SERVER.iconNames;
let buttonPressedStatus = buttonStatusInit(buttonNames);
let currentPressedButtons = [];
let anyButtonPressed = false;

function buttonStatusInit (names) {
    let buttonPressedStatusList = [];
    for (var i = 0; i < names.length; i++) {
        let button = {
            name: names[i],
            status: false,
        }
        buttonPressedStatusList.push(button);
    }
    return buttonPressedStatusList;
}

function Circle({ onLayout, ...props }) {
    const ref = React.useRef();
    function onLayoutCircle() {
        if (ref.current) {
            ref.current.setNativeProps({ fillColor: props.fillColor });
            ref.current.setNativeProps({ strokeColor: props.strokeColor});
        }
    }
    return <MapView.Circle ref={ref} onLayout={onLayoutCircle} {...props} />;
}

function ButtonView({...props}) {
    const ref = React.useRef();
    const buttonName = props.name;
    const crimeTypeCount = props.crimeTypeCount;
    const iconName = props.iconName;
    
    function onPressButtonView() {
        currentPressedButtons = [];
        anyButtonPressed = false;
        buttonPressedStatus.map((button, index) => {
            if (button.name == buttonName) {
                button.status = !button.status;
            }
            if (button.status) {
                anyButtonPressed = true;
                currentPressedButtons.push(button);
            }
        })
    }

    return <View ref={ref} style={{ backgroundColor: 'white', alignItems: 'center' }}>
        <Button
            buttonStyle={{ backgroundColor: 'white' }}
            type='clear'
            icon={<TypeIcon name={iconName} size={30} action={onPressButtonView} />}
        />
        <Text style={{ fontSize: 8 }}>{buttonName}</Text>
        <Text style={{ fontSize: 8 }}>{crimeTypeCount[buttonName] ? crimeTypeCount[buttonName] : 0}</Text>
    </View>
}

export default class MapPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            markers: [],
            index: 0,
            pointList: [],
            navigation: this.props.navigation,
            currentMarkerPressed: false,
            numHomicide: 0,
            crimeTypeCount: typeCount,
            currentRegion: {
                latitude: 41.88825,
                longitude: -87.6324,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            },
            zoom: 1,
        } 
        this.createMarkerOnPress = this.createMarkerOnPress.bind(this);
    }

    onRegionChange = (region) => {
        this.setState({ currentRegion: region })
        let zoom = Math.round(Math.log(360 / region.longitudeDelta) / Math.LN2);
        this.setState({zoom: zoom});
        const currentRegion = this.state.currentRegion;
        let requestType = `${SERVER.ROOT}getNearbyEvents/type?latitude=${currentRegion.latitude}&longitude=${currentRegion.longitude}&latDelta=${currentRegion.latitudeDelta}&lngDelta=${currentRegion.longitudeDelta}`;
        fetch(requestType)
        .then((response) => { return response.json(); })
        .then((typeCountData) => {
            let fetchedCrimeTypeCount = typeCount;
            for (var i = 0; i < typeCountData.length; i++) {
                let type = typeCountData[i]['Type'];
                let count = typeCountData[i]['Num'];
                fetchedCrimeTypeCount[type] = count
            }
            this.setState({ crimeTypeCount: fetchedCrimeTypeCount })
        });
        let newDate = new Date();
        let year = newDate.getFullYear();
        let month = newDate.getMonth() + 1;
        let requestPointsURL = "";
        if (!anyButtonPressed) {
            requestPointsURL = `${SERVER.ROOT}getNearbyEvents/heatmap?latitude=${currentRegion.latitude}&longitude=${currentRegion.longitude}&latDelta=${currentRegion.latitudeDelta}&lngDelta=${currentRegion.longitudeDelta}&year=${year}&month=${2}`;
            fetch(requestPointsURL)
                .then((response) => { return response.json(); })
                .then((locationData) => {
                    let fetchPointList = [];
                    for (var i = 0; i < locationData.length; i++) {
                        let point = {
                            latitude: (Number(locationData[i].latitude)),
                            longitude: Number(locationData[i].longitude),
                        };
                        fetchPointList.push(point);
                    }
                    this.setState({ pointList: fetchPointList});
                });
        } else {
            let fetchPointList = [];
            currentPressedButtons.map((button, index) => {
                let type = button.name;
                requestPointsURL = `${SERVER.ROOT}getNearbyEvents/showType?latitude=${currentRegion.latitude}&longitude=${currentRegion.longitude}&latDelta=${currentRegion.latitudeDelta}&lngDelta=${currentRegion.longitudeDelta}&year=${year}&month=${2}&type=${type}`;
                fetch(requestPointsURL)
                    .then((response) => { return response.json(); })
                    .then((locationData) => {
                        for (var i = 0; i < locationData.length; i++) {
                            let point = {
                                latitude: (Number(locationData[i].latitude)),
                                longitude: Number(locationData[i].longitude),
                            };
                            fetchPointList.push(point);
                        }
                        this.setState({ pointList: fetchPointList });
                    })
            })
        }
    }
    
    createMarkerOnPress = (event) => {
        this.setState({
            markers: [
                ...this.state.markers,
                {
                    coordinate: event.nativeEvent.coordinate,
                }
            ]
        })
    }

    render() {
        let crimeTypeCount = this.state.crimeTypeCount;
        return (
            <View style={{ flex: 1 }}>
                <MapView
                    provider={PROVIDER_GOOGLE}
                    showsUserLocation
                    followsUserLocation={true}
                    showsMyLocationButton
                    style={{ flex: 1 }}
                    initialRegion={{
                        latitude: 41.88825,
                        longitude: -87.6324,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                    onRegionChange={this.onRegionChange}>
                    {this.state.pointList.map((circle, index) => (
                        <Circle
                            key={index}
                            center={circle}
                            radius={30}
                            fillColor='#FD7659'
                            strokeColor='transparent'
                            {...circle}/>
                    ))}
                </MapView>
                <View style={styles.userProfileButtonContainer}>
                    <Button
                        onPress={() => { this.props.navigation.openDrawer() }}
                        type='clear'
                        icon={<Icon name='face-profile' size={60} />}
                    />
                </View>
                <View style={styles.buttonContainer}>
                    {buttonNames.map((name, index) => (
                        <ButtonView name={name} crimeTypeCount={crimeTypeCount} iconName={iconNames[index]} pressStatus={buttonPressedStatus[name]}></ButtonView>
                    ))}
                </View>
            </View>
        );
    };
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapStyle: {
        flex: 0,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height
    },
    userProfileButtonContainer: {
        position: 'absolute',
        top: '79%',
        right: '0%',
        flex: 1,
    },
    buttonContainer: {
        flexDirection: 'column',
        position: 'absolute',
        flex: 1,
        top: '5%',
        right: '0%',
        alignItems: 'center',
        width: '15%',
    },
});
