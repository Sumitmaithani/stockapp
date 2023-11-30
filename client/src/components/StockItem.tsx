import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';

const StockItem = ({name, ticker, price, image, change}: any) => {
  return (
    <View style={styles.Container}>
      <View style={{display: 'flex', flexDirection: 'row', gap: 20}}>
        {image ? (
          <Image
            source={{
              uri: `${image}?apiKey=IOUaEp4fkNOpBzZ32HRrhc8IPhwVvb8m`,
            }}
            style={{
              width: 50,
              height: 50,
              resizeMode: 'stretch',
              borderRadius: 10,
            }}
          />
        ) : (
          <Image
            source={{
              uri: `https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png`,
            }}
            style={{
              width: 50,
              height: 50,
              resizeMode: 'stretch',
              borderRadius: 10,
            }}
          />
        )}
        <View>
          <Text style={{fontSize: 20, fontFamily: 'poppins-regular'}}>
            {name.length > 22 ? name.substring(0, 21) + '...' : name}
          </Text>
          <Text
            style={{fontSize: 14, fontFamily: 'poppins-regular', marginTop: 5}}>
            {ticker}
          </Text>
        </View>
      </View>
      <View style={styles.SubContainer}>
        <View>
          <Text style={{fontSize: 20, fontFamily: 'poppins-regular'}}>
            ${price}
          </Text>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 7,
            }}>
            {change >= 0 ? (
              <>
                <Image
                  source={require('../../assets/images/gain.png')}
                  style={{width: 15, height: 15, marginTop: 5}}
                />
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: 'poppins-regular',
                    marginTop: 5,
                    color: 'green',
                  }}>
                  {change}%
                </Text>
              </>
            ) : (
              <>
                <Image
                  source={require('../../assets/images/loss.png')}
                  style={{width: 15, height: 15, marginTop: 5}}
                />
                <Text
                  style={{
                    fontSize: 14,
                    fontFamily: 'poppins-regular',
                    marginTop: 5,
                    color: 'red',
                  }}>
                  {change}%
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default StockItem;

const styles = StyleSheet.create({
  Container: {
    borderBottomWidth: 1,
    paddingBottom: 15,
    borderBlockColor: '#ECECEC',
    marginBottom: 15,
  },
  SubContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    right: 0,
  },
});
