package com.salamat.NeshanFullScreen;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Toast;

import com.salamat.R;

public class NeshanFullScreenActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_neshan_full_screen);
        Toolbar myToolbar = (Toolbar) findViewById(R.id.my_toolbar);
        setSupportActionBar(myToolbar);
        Intent intent = getIntent();
        if (intent != null) {
            String lat = intent.getExtras().getString("latitude");
            String lon = intent.getExtras().getString("longitde");
            Toast.makeText(this, lat, Toast.LENGTH_SHORT).show();
        }
    }
}
