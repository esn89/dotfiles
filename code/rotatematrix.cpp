#include <iostream>

using namespace std;

// Rotate a matrix 90 degrees to the right.

void swap(int &a, int &b) {
	int temp = a;
	a = b;
	b = temp;
}

void rotate(int array[][3]) {


	for (int i = 0; i < 3; i++) {
		for (int j = i; j < 3; j++) {
			swap(array[i][j], array[j][i]);
		}
	}

	for (int i = 0; i < 3; i++) {
		for (int j = 0; j < (3 / 2); j++) {
			swap(array[i][j], array[i][3 - j - 1]);
		}
	}

	for (int i = 0; i < 3; i++) {
		for (int j = 0; j < 3; j++) {
			cout << array[i][j] << " ";
		}
		cout << endl;
	}
	return;

}

int main() {

	//      [rows][columns]
	int array[3][3];

	array[0][0] = 1;
	array[0][1] = 2;
	array[0][2] = 3;
	array[1][0] = 4;
	array[1][1] = 5;
	array[1][2] = 6;
	array[2][0] = 7;
	array[2][1] = 8;
	array[2][2] = 9;

	//for (int i = 0; i < 3; i++) {
	//	for (int j = 0; j < 3; j++) {
	//		cout << array[i][j] << " ";
	//	}
	//	cout << endl;
	//}

	rotate(array);

	return 0;
}

