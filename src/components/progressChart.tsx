import React from 'react';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions, View } from 'react-native';

const screenWidth = Dimensions.get("window").width;

const data = {
  labels: ["Week 1", "2", "3", "4", "5", "6", "7"],
  datasets: [
    {
      data: [80],
      color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
      strokeWidth: 2,
    }
  ],
};

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: "#a259ff",
  },
  fillShadowGradient: "#a259ff",
  fillShadowGradientOpacity: 0.2,
};

const WeightChart = () => (
  <View>
    <LineChart
      data={data}
      width={screenWidth - 5}
      height={220}
      chartConfig={chartConfig}
      bezier
      style={{
        marginVertical: 8,
        borderRadius: 16,
        alignSelf: 'center',
      }}
    />
  </View>
);

export default WeightChart;
