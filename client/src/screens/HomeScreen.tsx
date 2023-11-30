import React, {useEffect, useState} from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import StockItem from '../components/StockItem';
import axios from 'axios';
import {ActivityIndicator} from 'react-native-paper';

function HomeScreen(): JSX.Element {
  const [text, setText] = React.useState('');
  const [focused, setFocused] = useState<boolean>(false);
  const [error, setError] = useState(false);
  const [errMsg, setErrMsg] = useState<any>('');
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);

  const getBorderColor = () => {
    if (error) {
      return 'red'; // Use red border when there's an error
    } else if (focused) {
      return '#1F41BB'; // Use purpel color border when focused
    } else {
      return '#ECECEC'; // Use gray border in other cases
    }
  };

  const fetchStockData = async () => {
    setError(false);
    setErrMsg('');

    if (!text) {
      setError(true);
      setErrMsg('Please type something.');
      return;
    }
    setLoading(true);

    try {
      const response = await axios.get(
        `http://localhost:3001/stocks?n=${text}`,
      );
      const updatedStocks = response.data.map((stock: any) => {
        return {
          ...stock,
          originalClose: stock.previousClose, // Store the original close price
        };
      });
      setStocks(updatedStocks);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setError(true);
      setErrMsg(
        "You've exceeded the maximum requests per minute, please wait or upgrade your subscription to continue.",
      );
      setLoading(false);
    }
  };

  // Function to update stock prices at intervals
  const updateStockPrices = () => {
    const updatedStocks = [...stocks];
    updatedStocks.forEach((stock: any) => {
      const randomChange = (Math.random() - 0.5) * 4;
      const updatedPrice = parseFloat(stock.previousClose) + randomChange;
      stock.previousClose = updatedPrice.toFixed(2).toString();
    });
    setStocks(updatedStocks);
  };

  // Effect to start updating prices when component mounts
  useEffect(() => {
    const updateInterval = setInterval(updateStockPrices, 3000); // Update every second, you can adjust this interval

    // Clear the interval when the component unmounts
    return () => clearInterval(updateInterval);
  }, [stocks]); // Add stocks as a dependency to the effect

  return (
    <SafeAreaView>
      <StatusBar barStyle={'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.container}>
        <View style={styles.searchContainer}>
          <TextInput
            onFocus={() => {
              setFocused(true);
              setError(false);
              setErrMsg('');
            }}
            onBlur={() => setFocused(false)}
            onChangeText={text => setText(text)}
            value={text}
            placeholder="Type number of stocks you want to see.."
            style={[
              {
                fontFamily: 'poppins-regular',
                fontSize: 14,
                padding: 10 * 2,
                borderRadius: 100,
                borderWidth: 3,
                borderColor: getBorderColor(),
              },
              focused && {
                borderWidth: 3,
                borderColor: '#7B66FF',
                shadowOffset: {width: 4, height: 10},
                shadowColor: '#1F41BB',
                shadowOpacity: 0.2,
                shadowRadius: 10,
              },
            ]}
            keyboardType="numeric"
          />
          {error && (
            <Text
              style={{
                fontFamily: 'poppins-regular',
                fontSize: 16,
                marginTop: 10,
                color: 'red',
              }}>
              {errMsg}
            </Text>
          )}
          <TouchableOpacity
            style={styles.searchImgContainer}
            onPress={fetchStockData}>
            <Image
              source={require('../../assets/images/Search-button.png')}
              style={styles.imageSearch}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.StocksContainer}>
          <Text style={styles.StockText}>Stocks</Text>
          <View style={{marginTop: 10}}>
            {loading ? (
              <View
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 200,
                }}>
                <ActivityIndicator
                  animating={true}
                  color={'#7B66FF'}
                  size={'large'}
                />
              </View>
            ) : stocks.length == 0 ? (
              <Text
                style={{
                  fontSize: 18,
                  fontFamily: 'poppins-regular',
                  textAlign: 'center',
                  textAlignVertical: 'center',
                  marginTop: 200,
                  color: 'grey',
                }}>
                No Stocks
              </Text>
            ) : (
              stocks.map((item: any) => {
                // Calculate percentage change
                const originalPrice = parseFloat(item.originalClose);
                const currentPrice = parseFloat(item.previousClose);
                const percentageChange =
                  ((currentPrice - originalPrice) / originalPrice) * 100;

                return (
                  <StockItem
                    key={item?.ticker}
                    name={item?.name}
                    ticker={item?.ticker}
                    price={item?.previousClose}
                    image={item?.logoUrl}
                    change={percentageChange.toFixed(2)}
                  />
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  searchContainer: {
    display: 'flex',
    position: 'relative',
  },
  searchImgContainer: {
    position: 'absolute',
    right: 0,
  },
  imageSearch: {
    width: 70,
    height: 65,
    borderTopRightRadius: 100,
    borderBottomRightRadius: 100,
  },
  StocksContainer: {
    paddingVertical: 20,
  },
  StockText: {
    fontFamily: 'poppins-bold',
    fontSize: 20,
    paddingVertical: 15,
  },
});

export default HomeScreen;
